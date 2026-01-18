import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ICreateUser, IPublicUserData } from '@full-stack-todo/shared/domain';

/**
 * User Service for retrieving user information
 * 
 * This service handles HTTP communication with the backend API for user operations.
 * It provides methods to retrieve user data from the server.
 * 
 * @Injectable decorator with 'root' means this service is a singleton available app-wide
 */
@Injectable({
  providedIn: 'root',
})
export class User {
  /**
   * HttpClient is injected using Angular's new inject() function
   * This is used to make HTTP requests (GET, POST, PUT, PATCH, DELETE)
   * 'readonly' ensures this reference can't be reassigned after initialization
   */
  private readonly http = inject(HttpClient);

  /**
   * Creates a new user account
   * 
   * HTTP Method: POST
   * Endpoint: /api/v1/users
   * 
   * Note: This is a public endpoint that does not require authentication.
   * The password will be hashed on the server before storage.
   * 
   * @param userData - User data containing email and password
   * @returns Observable<IPublicUserData> - The newly created user data (password excluded) wrapped in an Observable
   */
  createUser(userData: ICreateUser): Observable<IPublicUserData> {
    return this.http.post<IPublicUserData>(`/api/v1/users`, userData);
  }

  /**
   * Retrieves a single user by their unique ID
   * 
   * HTTP Method: GET
   * Endpoint: /api/v1/users/:id
   * 
   * Note: This endpoint requires authentication. Users can only access their own data.
   * The JWT token will be automatically added by the JWT interceptor.
   * 
   * @param userId - The unique identifier of the user to retrieve
   * @returns Observable<IPublicUserData> - The requested user data (password excluded) wrapped in an Observable
   */
  getUser(userId: string): Observable<IPublicUserData> {
    return this.http.get<IPublicUserData>(`/api/v1/users/${userId}`);
  }
}
