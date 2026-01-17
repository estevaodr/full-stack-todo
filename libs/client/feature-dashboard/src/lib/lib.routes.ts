import { Route } from '@angular/router';
import { FeatureDashboardComponent } from './FeatureDashboard/FeatureDashboard';
import { authGuard } from '@full-stack-todo/client/data-access';

export const featureDashboardRoutes: Route[] = [
  { 
    path: '', 
    component: FeatureDashboardComponent,
    canActivate: [authGuard],
  },
];
