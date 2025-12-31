// Re-export DTOs from shared library
export {
  CreateTodoDto,
  UpdateTodoDto,
  UpsertTodoDto,
} from '@full-stack-todo/shared';

export { ICreateTodo, IUpdateTodo, IUpsertTodo } from '@full-stack-todo/shared/domain'; 