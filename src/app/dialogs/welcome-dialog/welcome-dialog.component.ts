import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
    selector: 'app-welcome-dialog',
    templateUrl: './welcome-dialog.component.html',
    styleUrls: ['./welcome-dialog.component.scss'],
})
export class WelcomeDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<WelcomeDialogComponent>,
        private router: Router
    ) {}

    closeDialog() {
        this.dialogRef.close();
        this.router.navigate(['/overview/main-page']);
    }
}
