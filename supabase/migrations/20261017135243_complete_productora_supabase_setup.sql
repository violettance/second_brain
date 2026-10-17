-- Existing Second Brain project: preserve data and enforce the caller's RLS
-- through analytics views, including views used by other views.
begin;

do $migration$
declare
  view_name text;
begin
  foreach view_name in array array[
    'analytics_active_topics',
    'analytics_note_activity_by_hour',
    'analytics_note_activity_by_weekday',
    'analytics_note_depth_analysis',
    'analytics_tag_cooccurrence_matrix',
    'analytics_tag_usage_frequency',
    'analytics_total_thoughts_change',
    'connections_statistics',
    'daily_note_counts',
    'top_tags_view',
    'user_note_connections_statistics',
    'v2_analytics_knowledge_score',
    'v2_analytics_memory_distribution_bars',
    'v2_analytics_note_activity_by_hour',
    'v2_analytics_note_activity_by_weekday',
    'v2_analytics_note_depth_analysis',
    'v2_analytics_tag_cooccurrence_matrix',
    'v2_analytics_tag_usage_frequency',
    'v2_analytics_total_thoughts_change',
    'v2_daily_note_counts',
    'v2_entity_tags_view',
    'v2_top_tags_view',
    'v3_entity_tags_view',
    'v3_user_note_connections_statistics'
  ] loop
    if to_regclass(format('public.%I', view_name)) is not null then
      execute format('alter view public.%I set (security_invoker = true)', view_name);
    end if;
  end loop;
end;
$migration$;

-- Profile creation must succeed with account creation; swallowing errors leaves
-- accounts that can sign in but cannot load the app's required profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $function$
begin
  insert into public.profiles (id, name, email, created_at, updated_at)
  values (
    new.id,
    coalesce(nullif(btrim(new.raw_user_meta_data->>'name'), ''),
             nullif(split_part(new.email, '@', 1), ''), 'User'),
    coalesce(new.email, ''),
    now(), now()
  )
  on conflict (id) do nothing;
  return new;
end;
$function$;

-- This trigger function does not need to be callable through the public API.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Repair existing accounts without changing any existing profile or plan.
insert into public.profiles (id, name, email, created_at, updated_at)
select u.id,
       coalesce(nullif(btrim(u.raw_user_meta_data->>'name'), ''),
                nullif(split_part(u.email, '@', 1), ''), 'User'),
       coalesce(u.email, ''),
       coalesce(u.created_at, now()), now()
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id)
on conflict (id) do nothing;

notify pgrst, 'reload schema';
commit;
