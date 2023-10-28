import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate() {
    return new Promise<boolean>((resolve) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (!user) {
          resolve(true);
        } else {
          this.router.navigate(['/overview']);
          resolve(false);
        }
      });
    });
  }
}

