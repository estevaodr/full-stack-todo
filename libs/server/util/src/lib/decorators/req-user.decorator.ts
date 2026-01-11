import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Custom parameter decorator that returns all user data stored in the user object of a Request.
 * 
 * This decorator extracts the user object that was attached to the request by the JWT strategy
 * after successful authentication. The user object contains the decoded JWT payload.
 * 
 * @example
 * ```typescript
 * @Get('profile')
 * async getProfile(@ReqUser() user: any) {
 *   return user;
 * }
 * ```
 */
export const ReqUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

/**
 * Custom parameter decorator that returns the User ID stored in the user object of a Request.
 * 
 * This decorator extracts the userId property from the user object that was attached to the
 * request by the JWT strategy. The userId corresponds to the 'sub' claim in the JWT payload.
 * 
 * @example
 * ```typescript
 * @Get('todos')
 * async getTodos(@ReqUserId() userId: string) {
 *   return this.todoService.getAll(userId);
 * }
 * ```
 */
export const ReqUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.userId as string;
  }
);
