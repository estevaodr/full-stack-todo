'use client';

import { useCallback, useEffect, useState } from 'react';
import { TodoList } from '@/components/todo-list';
import { AddTodoDialog } from '@/components/add-todo-dialog';
import { Button } from '@/components/ui/button';
import { useTodos } from '@/hooks/use-todos';
import {
  ADD_TODO_SHORTCUT_KEY,
  ADD_TODO_SHORTCUT_TITLE,
} from '@/lib/keyboard-hints';

function AddIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
    </svg>
  );
}

export default function DashboardPage() {
  const [addOpen, setAddOpen] = useState(false);
  const { data: todos = [], isLoading } = useTodos();

  const openAddDialog = useCallback(() => setAddOpen(true), []);

  // Empty state teaches the first add inline; FAB is for in-flow access once todos exist.
  const showFab = !isLoading && todos.length > 0;

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() !== 'n') return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          target.closest('input, textarea, select, [role="dialog"]'))
      ) {
        return;
      }

      event.preventDefault();
      openAddDialog();
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openAddDialog]);

  return (
    <>
      <TodoList onAddTodo={openAddDialog} />

      {showFab ? (
        <Button
          type="button"
          onClick={openAddDialog}
          title={ADD_TODO_SHORTCUT_TITLE}
          aria-keyshortcuts={ADD_TODO_SHORTCUT_KEY}
          className="fixed bottom-8 right-8 z-50 h-12 gap-2 rounded-xl px-6 text-[15px] font-bold shadow-lg shadow-primary/30 motion-safe:active:scale-[0.98]"
        >
          <AddIcon />
          <span>Add Todo</span>
        </Button>
      ) : null}

      <AddTodoDialog open={addOpen} onOpenChange={setAddOpen} />
    </>
  );
}
