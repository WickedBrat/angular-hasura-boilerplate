import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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
    clientID: environment.auth0ClientId, // '<client-id>',
    domain: environment.auth0Domain, // '<domain>',
    responseType: 'token id_token',
    redirectUri: environment.auth0RedirectUri, // '<redirect-uri>',
    scope: 'openid'
  });

  constructor(private router: Router) {}

  /** Authorizes with Auth0 */
  public login(): void {
    this.auth0.authorize();
  }

  /** Logs out by clearing the access and ID tokens */
  public logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('id_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem('expires_at');
    // navigate to the home route
    location.reload();
    this.router.navigate(['/']);
  }

  /** Checks whether the current time is past the access token's expiry time */
  public isAuthenticated(): boolean {
    const expiresAt = JSON.parse(localStorage.getItem('expires_at') || '{}');
    return new Date().getTime() < expiresAt;
  }

  public handleAuthentication(): void {
    this.auth0.parseHash((err: any, authResult: any) => {
      console.log(authResult);
      if (authResult && authResult.accessToken && authResult.idToken) {
        window.location.hash = '';
        this.setSession(authResult);
        this.router.navigate(['/advanced']);
      } else if (err) {
        this.router.navigate(['/']);
        console.log(err);
      }
    });
  }

  private setSession(authResult: any): void {
    // Set the time that the access token will expire at
    const expiresAt = JSON.stringify(
      authResult.expiresIn * 1000 + new Date().getTime()
    );
    localStorage.setItem('access_token', authResult.accessToken);
    localStorage.setItem('user_id', authResult.idTokenPayload.sub);
    localStorage.setItem('id_token', authResult.idToken);
    localStorage.setItem('expires_at', expiresAt);
  }
}
