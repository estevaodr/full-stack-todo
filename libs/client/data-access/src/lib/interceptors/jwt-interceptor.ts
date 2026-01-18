import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { switchMap, take } from 'rxjs';
import { Auth } from '../auth';

/**
 * JWT Interceptor
 * 
 * A functional HTTP interceptor that automatically adds the JWT access token
 * to all outgoing HTTP requests as an Authorization header.
 * 
 * How it works:
 * 1. Intercepts all HTTP requests before they are sent
 * 2. Gets the current access token from the Auth service
 * 3. Clones the request and adds the Authorization header with the token
 * 4. Passes the modified request to the next interceptor in the chain
 * 
 * Usage:
 * This interceptor is registered in the application's HTTP client configuration.
 * It automatically applies to all HTTP requests, so components don't need to
 * manually add the Authorization header.
 * 
 * Example:
 * When a component calls http.get('/api/v1/todos'), this interceptor will
 * automatically add: Authorization: Bearer <jwt-token>
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  // Get the current access token from the Auth service
  // Use take(1) to get the current value and complete the observable
  return authService.accessToken$.pipe(
    take(1),
    switchMap((token) => {
      // If we have a token, clone the request and add the Authorization header
      if (token) {
        const clonedRequest = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        });
        return next(clonedRequest);
      }

      // If no token, pass the request through unchanged
  return next(req);
    })
  );
};
