import { Component } from '@angular/core';
import { getAuth } from 'firebase/auth';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent {
  auth = getAuth();
  user = this.auth.currentUser.email;

  constructor(private authService: AuthService){}

  logout(){
    this.authService.logout();
  }
}
