import { Route } from '@angular/router';
import { FeatureRegister } from './feature-register/feature-register';

/**
 * Registration Feature Routes
 * 
 * Defines the routes for the registration feature module.
 * This route can be imported and used in the main application routing configuration.
 */
export const featureRegisterRoutes: Route[] = [
  { path: '', component: FeatureRegister },
];
