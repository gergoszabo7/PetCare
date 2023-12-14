import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth.service';
import { FirebaseCrudService } from '../shared/firebase-crud.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
    constructor(private authService: AuthService) {}

    logout() {
        this.authService.logout();
    }
}
