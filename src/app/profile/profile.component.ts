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
import { doc } from '@angular/fire/firestore';
import firebase from 'firebase/compat';
import QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
import { QuerySnapshot } from '@angular/fire/compat/firestore';

interface DisplayedRequest {
    reqId: string;
    ownerId: string;
    vetId: string;
    message?: string;
    fromName?: string;
    fromEmail: string;
    fromMobile?: string;
}
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
    requestLoaded = false;
    requests: DisplayedRequest[] = [];

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
                this.listRequests();
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

    listRequests() {
        let vetId: string;
        let ownerId: string;
        if (this.userData.isVet) {
            vetId = this.loggedInUser.uid;
        } else {
            ownerId = this.loggedInUser.uid;
        }
        this.firebaseCrudService
            .getRequests(vetId, ownerId)
            .then((querySnapshot) => {
                const documentSnapshots: QueryDocumentSnapshot<unknown>[] =
                    querySnapshot.docs as unknown as QueryDocumentSnapshot<unknown>[];

                documentSnapshots.forEach((doc, index) => {
                    this.requests[index] = {
                        reqId: doc.id,
                        ownerId: doc.data()['ownerId'],
                        vetId: doc.data()['vetId'],
                        message: doc.data()['message'],
                        fromEmail: '',
                    };
                    const idToGet = this.userData.isVet
                        ? doc.data()['ownerId']
                        : doc.data()['vetId'];

                    this.firebaseCrudService
                        .getUserData(idToGet)
                        .then((userData) => {
                            this.requests[index].fromEmail =
                                userData.data()['email'];
                            this.requests[index].fromName =
                                userData.data()['name'];
                            this.requests[index].fromMobile =
                                userData.data()['mobile'];
                        });
                });

                this.requestLoaded = true;
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Az adatok nem elérhetők',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
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

    deleteRequest(reqId: string) {
        this.requestLoaded = false;
        this.firebaseCrudService.deleteRequest(reqId, () => {
            this.requests = [];
            this.listRequests();
            this.snackbarService.openSnackBar('Kérelem törölve!', undefined, {
                duration: 4000,
                panelClass: ['green-snackbar'],
            });
        });
    }

    approveRequest(reqId: string, ownerId: string) {
        this.requestLoaded = false;
        this.firebaseCrudService
            .updateUserAfterRequest(ownerId, this.loggedInUser.uid)
            .then(() => {
                this.firebaseCrudService.deleteRequest(reqId, () => {
                    this.requests = [];
                    this.listRequests();
                    this.snackbarService.openSnackBar(
                        'Kérelem elfogadva!',
                        undefined,
                        {
                            duration: 4000,
                            panelClass: ['green-snackbar'],
                        }
                    );
                });
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
                this.requestLoaded = true;
            });
    }
}
