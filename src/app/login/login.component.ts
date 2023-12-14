import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../shared/auth.service';
import { SnackbarService } from '../shared/snackbar.service';
import { Title } from '@angular/platform-browser';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
    email = '';
    password = '';
    reg_email = '';
    reg_password = '';
    reg_password_again = '';
    is_vet = false;

    loginForm: FormGroup;

    constructor(
        private auth: AuthService,
        private snackBarService: SnackbarService,
        private titleService: Title
    ) {}

    login() {
        if (this.email === '') {
            this.snackBarService.openSnackBar(
                'Kérem írjon be e-mail címet!',
                undefined,
                { duration: 3000, panelClass: ['red-snackbar'] }
            );
            return;
        }
        if (this.password === '') {
            this.snackBarService.openSnackBar(
                'Kérem írjon be jelszót!',
                undefined,
                { duration: 3000, panelClass: ['red-snackbar'] }
            );
            return;
        }

        this.auth.login(this.email, this.password);
    }

    register() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const passwordRegex = /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])/;
        if (this.reg_email === '' || !emailRegex.test(this.reg_email)) {
            this.snackBarService.openSnackBar(
                'Érvényes e-mail címet adjon meg!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        if (this.reg_password === '') {
            this.snackBarService.openSnackBar(
                'Kérem írjon be jelszót!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        if (this.reg_password.length < 8) {
            this.snackBarService.openSnackBar(
                'A jelszónak legalább 8 karakter hosszúnak kell lennie!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        if (!passwordRegex.test(this.reg_password)) {
            this.snackBarService.openSnackBar(
                'A jelszónak tartalmaznia kell legalább egy számot, legalább egy nagybetűs és egy kisbetűs karaktert!',
                undefined,
                { duration: 5000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        if (this.reg_password !== this.reg_password_again) {
            this.snackBarService.openSnackBar(
                'A jelszavaknak meg kell egyezniük',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }

        this.auth.register(this.reg_email, this.reg_password, this.is_vet);
    }
}
