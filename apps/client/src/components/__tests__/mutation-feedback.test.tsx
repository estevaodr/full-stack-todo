import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi, afterEach } from 'vitest';
import {
  MutationFeedbackProvider,
  useMutationFeedback,
} from '@/components/mutation-feedback';

function TestHost() {
  const { showFeedback } = useMutationFeedback();
  return (
    <button type="button" onClick={() => showFeedback('Todo added')}>
      Notify
    </button>
  );
}

describe('MutationFeedbackProvider', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows and dismisses a success toast', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <MutationFeedbackProvider>
        <TestHost />
      </MutationFeedbackProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Notify' }));

    expect(screen.getByRole('status')).toHaveTextContent('Todo added');

    await user.click(screen.getByRole('button', { name: 'Dismiss notification' }));
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('auto-dismisses after timeout', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <MutationFeedbackProvider>
        <TestHost />
      </MutationFeedbackProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Notify' }));
    expect(screen.getByRole('status')).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
