'use client';

import { useState } from 'react';
import { TodoList } from '@/components/todo-list';
import { AddTodoDialog } from '@/components/add-todo-dialog';

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <>
      <TodoList />

      {/* Floating Action Button — matches login/register button pattern */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="fixed bottom-8 right-8 bg-[#6686B3] hover:bg-[#5775A0] active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-[#6686B3]/40 transition-all flex items-center gap-2 px-6 h-[48px] z-50 text-[15px]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
        </svg>
        <span>Add Todo</span>
      </button>

      <AddTodoDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
