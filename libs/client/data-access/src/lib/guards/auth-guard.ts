import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '../auth';

/**
 * Auth Guard
 * 
 * A functional route guard that protects routes requiring authentication.
 * 
 * How it works:
 * 1. Checks if the user has a valid (non-expired) JWT token
 * 2. If the token is valid, allows navigation to proceed
 * 3. If the token is expired or missing, redirects to the login page
 * 4. Includes the attempted URL as a returnUrl query parameter so users
 *    can be redirected back after logging in
 * 
 * Usage:
 * Add this guard to route configurations that require authentication:
 * 
 * ```typescript
 * { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 * ```
 * 
 * Example:
 * If a user tries to access /dashboard without a valid token, they will be
 * redirected to /login?returnUrl=%2Fdashboard
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  // Check if the token is expired
  if (authService.isTokenExpired()) {
    // Token is expired or missing, redirect to login
    // Include the attempted URL as returnUrl so we can redirect back after login
    const returnUrl = encodeURIComponent(state.url);
    router.navigate(['/login'], { queryParams: { returnUrl } });
    return false;
  }

  // Token is valid, allow navigation
  return true;
};
