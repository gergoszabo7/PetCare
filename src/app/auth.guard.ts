import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  auth = getAuth();

  constructor(private router: Router) {}

  canActivate() {
    return new Promise<boolean>((resolve) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          console.log(user);
          resolve(true); // User is authenticated, allow navigation
        } else {
          this.router.navigate(['/login']);
          resolve(false); // User is not authenticated, prevent navigation
        }
      });
    });
  }
  
}
