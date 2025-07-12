import React, { useState, useEffect } from 'react';
import { Database } from '../../types/database';
import { TaskCard } from './TaskCard';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { supabase } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type Columns = Record<Task['status'], {
    title: string;
    tasks: Task[];
}>;

interface KanbanBoardProps {
  initialTasks: Task[];
  onSelectTask: (task: Task) => void;
}

const KANBAN_COLUMN_CONFIG: { title: string; status: Task['status'] }[] = [
    { title: 'To Do', status: 'TO DO' },
    { title: 'In Progress', status: 'IN PROGRESS' },
    { title: 'Done', status: 'DONE' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ initialTasks, onSelectTask }) => {
    const [columns, setColumns] = useState<Columns | null>(null);

    useEffect(() => {
        const groupedTasks = KANBAN_COLUMN_CONFIG.reduce((acc, col) => {
            acc[col.status] = initialTasks
                .filter(task => task.status === col.status)
                .sort((a, b) => a.position_index - b.position_index);
            return acc;
        }, {} as Record<Task['status'], Task[]>);
        
        setColumns({
            'TO DO': { title: 'To Do', tasks: groupedTasks['TO DO'] || [] },
            'IN PROGRESS': { title: 'In Progress', tasks: groupedTasks['IN PROGRESS'] || [] },
            'DONE': { title: 'Done', tasks: groupedTasks['DONE'] || [] }
        });
    }, [initialTasks]);

    const handleDragEnd = async (result: DropResult) => {
        const { source, destination } = result;
        if (!destination || !columns) return;

        const sourceColId = source.droppableId as Task['status'];
        const destColId = destination.droppableId as Task['status'];

        const startCol = columns[sourceColId];
        const endCol = columns[destColId];
        
        const sourceTasks = [...startCol.tasks];
        const destTasks = sourceColId === destColId ? sourceTasks : [...endCol.tasks];

        const [movedTask] = sourceTasks.splice(source.index, 1);
        // Update the moved task's status locally if moved to a different column
        if (sourceColId !== destColId) {
          movedTask.status = destColId;
        }
        destTasks.splice(destination.index, 0, movedTask);

        const newColumns = {
            ...columns,
            [sourceColId]: {
                ...startCol,
                tasks: sourceTasks
            },
            [destColId]: {
                ...endCol,
                tasks: destTasks
            }
        };

        setColumns(newColumns); // Optimistic update

        // --- Database Updates ---
        const dbUpdates: Promise<any>[] = [];

        // Update status and position of the moved task
        dbUpdates.push(
            supabase.from('tasks').update({ 
                status: destColId, 
                position_index: destination.index 
            }).eq('id', movedTask.id)
        );

        // Re-index all tasks in the destination column
        destTasks.forEach((task, index) => {
            dbUpdates.push(
                supabase.from('tasks').update({ position_index: index }).eq('id', task.id)
            );
        });

        // If moved to a different column, re-index all tasks in the source column
        if (sourceColId !== destColId) {
            sourceTasks.forEach((task, index) => {
                dbUpdates.push(
                    supabase.from('tasks').update({ position_index: index }).eq('id', task.id)
                );
            });
        }

        const results = await Promise.all(dbUpdates);
        const hasError = results.some(res => res.error);

        if (hasError) {
            console.error("Failed to update tasks in Supabase. Reverting UI changes.");
             // Revert optimistic update on error by resetting to initial state
            // (A more robust solution might store pre-drag state, but this is simpler for now)
            const groupedTasks = initialTasks.reduce((acc, task) => {
                const status = task.status;
                if (!acc[status]) acc[status] = [];
                acc[status].push(task);
                return acc;
            }, {} as Record<Task['status'], Task[]>);
            setColumns({
                'TO DO': { title: 'To Do', tasks: groupedTasks['TO DO'] || [] },
                'IN PROGRESS': { title: 'In Progress', tasks: groupedTasks['IN PROGRESS'] || [] },
                'DONE': { title: 'Done', tasks: groupedTasks['DONE'] || [] }
            });
        }
    };

    if (!columns) return null; // Or a loading spinner

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(columns).map(([columnId, column]) => (
                    <Droppable droppableId={columnId} key={columnId}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`bg-slate-900/70 rounded-xl p-4 transition-colors ${snapshot.isDraggingOver ? 'bg-slate-800/60' : ''}`}
                            >
                                <h3 className="text-lg font-semibold text-white mb-4 sticky top-0 bg-slate-900/70 py-2">
                                    {column.title}
                                    <span className="ml-2 text-sm font-normal text-slate-400">
                                        {column.tasks.length}
                                    </span>
                                </h3>
                                <div className="space-y-4">
                                    {column.tasks.map((task, index) => (
                                        <Draggable key={task.id} draggableId={task.id} index={index}>
                                            {(provided, snapshot) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    style={{...provided.draggableProps.style, opacity: snapshot.isDragging ? 0.8 : 1}}
                                                >
                                                    <TaskCard task={task} onSelectTask={onSelectTask} />
                                                </div>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            </div>
                        )}
                    </Droppable>
                ))}
            </div>
        </DragDropContext>
    );
}; 