import { Route } from '@angular/router';
import { ClientFeatureLoginComponent } from './client-feature-login/client-feature-login.component';

/**
 * Login Feature Routes
 * 
 * Defines the routes for the login feature module.
 * This route can be imported and used in the main application routing configuration.
 */
export const featureLoginRoutes: Route[] = [
  { path: '', component: ClientFeatureLoginComponent },
];
