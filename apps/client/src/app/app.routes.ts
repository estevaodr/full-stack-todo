import { Route } from '@angular/router';
import { featureDashboardRoutes } from '@full-stack-todo/client/feature-dashboard';
import { featureLoginRoutes } from '@full-stack-todo/client/feature-login';

export const appRoutes: Route[] = [
  { path: 'login', children: featureLoginRoutes },
  { path: 'dashboard', children: featureDashboardRoutes },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
];
