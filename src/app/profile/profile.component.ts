import { Component, OnInit } from '@angular/core';
import { getAuth, EmailAuthProvider } from 'firebase/auth';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import {
    AbstractControl,
    FormBuilder,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import {
    reauthenticateWithCredential,
    updatePassword,
} from '@angular/fire/auth';
import { SnackbarService } from '../shared/snackbar.service';
@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
    auth = getAuth();
    loggedInUser = this.auth.currentUser;
    userData: any;
    profileForm: FormGroup;
    updatePasswordForm: FormGroup;
    loaded = false;

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private fb: FormBuilder,
        private snackbarService: SnackbarService
    ) {}
    ngOnInit(): void {
        this.firebaseCrudService
            .getUserData(this.loggedInUser.uid)
            .then((user) => {
                this.userData = user.data();
                this.initializeForms();
                this.loaded = true;
            });
    }

    initializeForms(): void {
        this.profileForm = this.fb.group({
            email: [
                this.userData.email ?? '',
                [this.emailValidator(), Validators.required],
            ],
            name: [this.userData.name ?? '', [this.nameValidator()]],
            mobile: [this.userData.mobile ?? '', [this.phoneNumberValidator()]],
        });
        this.updatePasswordForm = this.fb.group({
            oldPassword: [''],
            newPassword: [
                '',
                [this.passwordValidator(), Validators.minLength(8)],
            ],
            newPasswordAgain: ['', [this.passwordMatchValidator()]],
        });
    }

    emailValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(control.value)) {
                    return { invalidEmail: { value: control.value } };
                }
            }
            return null;
        };
    }

    phoneNumberValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                const phoneNumberRegex = /^[0-9]{9}$/;
                if (!phoneNumberRegex.test(control.value)) {
                    return { invalidPhoneNumber: { value: control.value } };
                }
            }
            return null;
        };
    }

    nameValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                const nameRegex =
                    /^[\p{L}áéíóöőúüűÁÉÍÓÖŐÚÜŰ.]+(?:[\s.-][\p{L}áéíóöőúüűÁÉÍÓÖŐÚÜŰ.]+)*$/u;
                if (!nameRegex.test(control.value)) {
                    return { invalidName: { value: control.value } };
                }
            }
            return null;
        };
    }

    passwordValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (control.value) {
                const passRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/u;
                if (!passRegex.test(control.value)) {
                    return { invalidPassword: { value: control.value } };
                }
            }
            return null;
        };
    }

    passwordMatchValidator(): ValidatorFn {
        return (
            control: AbstractControl
        ): { [key: string]: boolean } | null => {
            const newPasswordControl =
                this.updatePasswordForm?.get('newPassword');
            if (!newPasswordControl) {
                return null;
            }

            const newPassword = newPasswordControl.value;
            const newPasswordAgain = control.value;

            if (newPassword !== newPasswordAgain) {
                return { passwordMismatch: true };
            }

            return null;
        };
    }

    updatePassword() {
        if (this.updatePasswordForm.invalid) {
            this.snackbarService.openSnackBar(
                'Töltse ki megfelelően a mezőket!',
                undefined,
                {
                    duration: 3000,
                    panelClass: ['red-snackbar'],
                }
            );
            return;
        }
        const credential = EmailAuthProvider.credential(
            this.loggedInUser.email,
            this.updatePasswordForm.get('oldPassword')?.value
        );
        reauthenticateWithCredential(this.loggedInUser, credential)
            .then(() => {
                updatePassword(
                    this.loggedInUser,
                    this.updatePasswordForm.get('newPassword')?.value
                )
                    .then(() => {
                        this.snackbarService.openSnackBar(
                            'Jelszó frissítve!',
                            undefined,
                            {
                                duration: 3000,
                                panelClass: ['green-snackbar'],
                            }
                        );
                    })
                    .catch((error) => {
                        this.snackbarService.openSnackBar(
                            'Hiba történt, próbálkozzon újra!',
                            undefined,
                            {
                                duration: 3000,
                                panelClass: ['red-snackbar'],
                            }
                        );
                    });
            })
            .catch((error) => {
                this.snackbarService.openSnackBar(
                    'Régi jelszó nem megfelelő!',
                    undefined,
                    {
                        duration: 3000,
                        panelClass: ['red-snackbar'],
                    }
                );
            });
    }

    updateUser() {
        if (this.profileForm.invalid) {
            this.snackbarService.openSnackBar(
                'Töltse ki megfelelően a mezőket!',
                undefined,
                {
                    duration: 3000,
                    panelClass: ['red-snackbar'],
                }
            );
            return;
        }
        this.firebaseCrudService.updateUser(this.loggedInUser.uid, {
            email: this.profileForm.get('email')?.value,
            name: this.profileForm.get('name')?.value,
            mobile: this.profileForm.get('mobile')?.value,
        });
    }
}
