import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { of, Observable } from 'rxjs';
import { vi } from 'vitest';
import { App } from './app';
import { Auth } from '@full-stack-todo/client/data-access';
import { IAccessTokenPayload } from '@full-stack-todo/shared/domain';

/**
 * Mock Auth Service for testing
 */
class MockAuthService {
  userData$: Observable<IAccessTokenPayload | null> = of(null);
  accessToken$ = of(null);
  loadToken = vi.fn();
  logoutUser = vi.fn();
}

describe('App', () => {
  let mockAuthService: MockAuthService;
  let mockRouter: Router;

  beforeEach(async () => {
    mockAuthService = new MockAuthService();
    
    await TestBed.configureTestingModule({
      imports: [
        App,
        RouterModule.forRoot([]), // Provide router for testing
      ],
      providers: [
        { provide: Auth, useValue: mockAuthService },
      ],
    }).compileComponents();
    
    mockRouter = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should call loadToken on initialization', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    expect(mockAuthService.loadToken).toHaveBeenCalled();
  });

  it('should render router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render skip link', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const skipLink = compiled.querySelector('a.skip-link');
    expect(skipLink).toBeTruthy();
    expect(skipLink?.textContent).toContain('Skip to main content');
  });

  it('should render header', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.app-header')).toBeTruthy();
  });

  it('should show login link when user is not logged in', async () => {
    mockAuthService.userData$ = of(null);
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const loginLink = compiled.querySelector('a[href="/login"]');
    expect(loginLink).toBeTruthy();
  });

  it('should show user greeting when logged in', async () => {
    mockAuthService.userData$ = of({ email: 'test@example.com', sub: 'user-123' });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const greeting = compiled.querySelector('.app-header__greeting');
    expect(greeting?.textContent).toContain('test@example.com');
  });

  it('should call logout and navigate to login when logout is clicked', () => {
    const navigateSpy = vi.spyOn(mockRouter, 'navigate');
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    
    app.logout();
    
    expect(mockAuthService.logoutUser).toHaveBeenCalled();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
