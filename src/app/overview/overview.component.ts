import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  auth: Auth;
  user: string;

  constructor(private authService: AuthService, private router: Router){}

  ngOnInit(): void {
    if (getAuth()) {
      this.auth = getAuth();
      this.user = this.auth.currentUser.email;
    }
  }

  logout(){
    this.authService.logout();
  }
}
