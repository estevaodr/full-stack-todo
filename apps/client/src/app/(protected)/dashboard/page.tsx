'use client';

import { useState } from 'react';
import { TodoList } from '@/components/todo-list';
import { AddTodoDialog } from '@/components/add-todo-dialog';

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <TodoList />

      {/* Floating Action Button — from Stitch dashboard-light.html */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-8 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-2 px-6 py-4 rounded-full shadow-lg shadow-primary/40 transition-all hover:scale-105 active:scale-95 z-50"
      >
        <span className="material-symbols-outlined text-2xl">add</span>
        <span className="font-bold tracking-wide">Add Todo</span>
      </button>

      <AddTodoDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
