import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@full-stack-todo/client/data-access';
import { Observable } from 'rxjs';
import { IAccessTokenPayload } from '@full-stack-todo/shared/domain';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'fse-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  /**
   * Injected Auth service for authentication operations
   */
  private readonly auth = inject(Auth);

  /**
   * Injected Router for navigation
   */
  private readonly router = inject(Router);

  /**
   * Observable for user data from the JWT token
   * Components can use this with async pipe to display user information
   */
  readonly user$: Observable<IAccessTokenPayload | null> = this.auth.userData$;

  protected title = 'todo list';

  /**
   * Initialize the app by loading any existing token from localStorage
   * This allows users to remain authenticated across page refreshes
   */
  ngOnInit(): void {
    this.auth.loadToken();
  }

  /**
   * Logs out the current user and navigates to the login page
   */
  logout(): void {
    this.auth.logoutUser();
    this.router.navigate(['/login']);
  }
}
