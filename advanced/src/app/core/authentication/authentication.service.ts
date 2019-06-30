import { Injectable } from '@angular/core';
import * as auth0 from 'auth0-js';
import { Router } from '@angular/router';
import { environment } from '@env/environment';

/**
 * Provides a base for authentication workflow.
 * The Credentials interface as well as login/logout methods should be replaced with proper implementation.
 */
@Injectable()
export class AuthenticationService {
  auth0 = new auth0.WebAuth({
    clientID: environment.auth0ClientId,
    domain: environment.auth0Domain,
    responseType: 'token id_token',
    audience: `https://${environment.auth0Domain}/userinfo`,
    redirectUri: environment.auth0RedirectUri,
    scope: 'openid profile email' // profile and email are optional
  });

  constructor(private router: Router) {}

  /** Gets the id of the user that's logged in */
  get userId(): string {
    return this._userId;
  }

  /** Gets the access token used for our logged in user's id token */
  get accessToken(): string {
    return this._accessToken;
  }

  /** Gets logged in user's id token */
  get idToken(): string {
    return this._idToken;
  }

  private get _userId(): string {
    return localStorage.getItem('user_id');
  }

  private set _userId(userId: string) {
    this.setOrClearLocalStorage('user_id', userId);
  }

  private get _accessToken(): string {
    return localStorage.getItem('access_token');
  }

  private set _accessToken(token: string) {
    this.setOrClearLocalStorage('access_token', token);
  }

  private get _idToken(): string {
    return localStorage.getItem('id_token');
  }

  private set _idToken(token: string) {
    this.setOrClearLocalStorage('id_token', token);
  }

  private get _expiresAt(): number {
    return Number(localStorage.getItem('expires_at')) || 0;
  }

  private set _expiresAt(expiry: number) {
    this.setOrClearLocalStorage('expires_at', expiry);
  }

  private get _loginPath(): string {
    return localStorage.getItem('login_path') || '/';
  }

  private set _loginPath(uri: string) {
    this.setOrClearLocalStorage('login_path', uri);
  }

  private setOrClearLocalStorage(key: string, value: any) {
    if (value) {
      localStorage.setItem(key, value as string);
    } else {
      localStorage.removeItem(key);
    }
  }

  /** Authorizes with Auth0 */
  public login(): void {
    this._loginPath = window.location.pathname;
    this.auth0.authorize();
  }

  /** Clears application credentials and logs the user out from Auth0 */
  public logout(): void {
    this.softLogout();
    this.auth0.logout({
      // Tell Auth0 to redirect back to the site root
      // (the site URL should be added to your Auth0 application's list of Allowed Logout URLs)
      returnTo: window.location.origin
    });
  }

  /** Clears application credentials without logging out from Auth0 session */
  public softLogout(): void {
    this._userId = null;
    this._accessToken = null;
    this._idToken = null;
    this._expiresAt = null;
  }

  /** Checks whether the current time is past the access token's expiry time */
  public isAuthenticated(): boolean {
    if (new Date().getTime() < this._expiresAt) {
      return true;
    } else {
      this.softLogout();
      return false;
    }
  }

  /** Attempts to renew the user's access and id tokens */
  public renewTokens(): void {
    this.auth0.checkSession({}, (err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.localLogin(authResult);
      } else if (err) {
        console.error(
          'Failed to renew authentication token. Forcing logout.',
          err
        );
        this.logout();
      }
    });
  }

  /** Parses the current window location's hash fragment as Auth0 credentials, stores the results in local session storage */
  public handleAuthentication(): void {
    this.auth0.parseHash((err: any, authResult: any) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.localLogin(authResult);
        window.location.hash = '';

        // At this point, we could query environment.graphqlEndpoint for user profile details,
        // perform any initial caching and/or trigger user notifications as appropriate.

        // Redirect the user back to where they were before logging in
        this.router.navigate([this._loginPath]);
        setTimeout(() => {
          window.location.reload();
        }, 200);
      } else if (err) {
        console.error('Authentication error', err);
      }
    });
  }

  private localLogin(authResult: any): void {
    // Convert expiresIn (seconds) to epoch time (milliseconds from now)
    this._expiresAt = authResult.expiresIn * 1000 + Date.now();
    this._accessToken = authResult.accessToken;
    this._idToken = authResult.idToken;
    this._userId = authResult.idTokenPayload.sub;
  }
}
