// Re-export DTOs from shared library
export {
  CreateTodoDto,
  UpdateTodoDto,
  UpsertTodoDto,
  TodoDto,
} from '@full-stack-todo/shared';

export { ICreateTodo, IUpdateTodo, IUpsertTodo } from '@full-stack-todo/shared/domain'; 