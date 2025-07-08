# Analytics Data Flow & Pattern

This document describes the standard approach for implementing analytics metrics and charts in the project. Follow this pattern for all analytics cards and visualizations (e.g., Total Thoughts, Active Topics, Knowledge Score, Trend Charts, etc.).

## 1. Create a Supabase View for Each Metric

- For each analytics metric (e.g., total thoughts, unique tags, knowledge score), create a dedicated SQL view in Supabase.
- The view should return aggregate values for:
  - Last 7 days (`sum_7`)
  - Previous 7 days (`sum_prev_7`)
  - Last 30 days (`sum_30`)
  - Previous 30 days (`sum_prev_30`)
  - All time (`sum_all`)
- Example (for unique tags):

```sql
create or replace view analytics_active_topics as
select
  (select count(distinct tag) from (
    select unnest(tags) as tag
    from (
      select tags from short_term_notes where note_date >= current_date - interval '6 days'
      union all
      select tags from long_term_notes where note_date >= current_date - interval '6 days'
    ) all_notes
  ) t where tag is not null and tag <> '') as sum_7,
  (select count(distinct tag) from (
    select unnest(tags) as tag
    from (
      select tags from short_term_notes where note_date >= current_date - interval '13 days' and note_date < current_date - interval '6 days'
      union all
      select tags from long_term_notes where note_date >= current_date - interval '13 days' and note_date < current_date - interval '6 days'
    ) all_notes
  ) t where tag is not null and tag <> '') as sum_prev_7,
  (select count(distinct tag) from (
    select unnest(tags) as tag
    from (
      select tags from short_term_notes where note_date >= current_date - interval '29 days'
      union all
      select tags from long_term_notes where note_date >= current_date - interval '29 days'
    ) all_notes
  ) t where tag is not null and tag <> '') as sum_30,
  (select count(distinct tag) from (
    select unnest(tags) as tag
    from (
      select tags from short_term_notes where note_date >= current_date - interval '59 days' and note_date < current_date - interval '29 days'
      union all
      select tags from long_term_notes where note_date >= current_date - interval '59 days' and note_date < current_date - interval '29 days'
    ) all_notes
  ) t where tag is not null and tag <> '') as sum_prev_30,
  (select count(distinct tag) from (
    select unnest(tags) as tag
    from (
      select tags from short_term_notes
      union all
      select tags from long_term_notes
    ) all_notes
  ) t where tag is not null and tag <> '') as sum_all;
```

## 2. Fetch Data from the View in the Frontend

- In the React component, use a `useEffect` to fetch the view (e.g., `analytics_active_topics`) from Supabase.
- Select the correct value based on the selected time range (`7d`, `30d`, `all`).
- Example:

```js
const { data, error } = await supabase
  .from('analytics_active_topics')
  .select('*')
  .single();

let total = 0;
if (timeRange === '7d') total = Number(data.sum_7) || 0;
else if (timeRange === '30d') total = Number(data.sum_30) || 0;
else total = Number(data.sum_all) || 0;
```

- For percentage change, use the previous period value (e.g., `sum_prev_7` for 7 days) and calculate:

```js
let change = null;
if (prev !== null && prev > 0) {
  change = Math.round(((total - prev) / prev) * 100);
}
```

## 3. Apply This Pattern to All Analytics

- Repeat this approach for all analytics cards and charts (e.g., Knowledge Score, Total Thoughts, Trends, etc.).
- This ensures all calculations are done in the database, keeping the frontend simple and consistent.

## 4. Trend Charts

- For trend charts (e.g., daily note creation), create a view that returns daily/cumulative values.
- Fetch and process the data in the frontend as needed for the chart.

---

**Summary:**
- Always aggregate and calculate analytics in Supabase views.
- Fetch only the needed values in the frontend.
- This pattern ensures consistency, performance, and easy maintenance for all analytics features. 