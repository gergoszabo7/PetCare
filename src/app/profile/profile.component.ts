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
import firebase from 'firebase/compat';
import QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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
    relLoaded = false;
    requests: DisplayedRequest[] = [];
    relatedUsers = [];

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private fb: FormBuilder,
        private snackbarService: SnackbarService,
        private dialog: MatDialog
    ) {}
    ngOnInit(): void {
        this.firebaseCrudService
            .getUserData(this.loggedInUser.uid)
            .then((user) => {
                this.userData = user.data();
                this.initializeForms();
                this.listRelations();
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
                this.requestLoaded = true;
            });
    }

    listRelations() {
        if (this.userData.isVet) {
            this.firebaseCrudService
                .getRelatedUsers(this.loggedInUser.uid)
                .then((querySnapshot) => {
                    querySnapshot.forEach((doc) => {
                        this.relatedUsers.push({ id: doc.id, ...doc.data() });
                    });
                    this.relLoaded = true;
                })
                .catch(() => {
                    this.snackbarService.openSnackBar(
                        'Az adatok nem elérhetők',
                        undefined,
                        { duration: 3000, panelClass: ['red-snackbar'] }
                    );
                    this.relLoaded = true;
                });
        } else {
            if (!this.userData.vet) {
                this.relatedUsers = [];
                this.relLoaded = true;
                return;
            }
            this.firebaseCrudService
                .getUserData(this.userData.vet)
                .then((vet) => {
                    this.relatedUsers.push(vet.data());
                    this.relLoaded = true;
                })
                .catch(() => {
                    this.snackbarService.openSnackBar(
                        'Az adatok nem elérhetők',
                        undefined,
                        { duration: 3000, panelClass: ['red-snackbar'] }
                    );
                    this.relLoaded = true;
                });
        }
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
                    .catch(() => {
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
            .catch(() => {
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
            .catch(() => {
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

    unassignUser(uid: string) {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Leiratkozás',
                message: 'Biztosan elvégzi a leiratkozást?',
            },
            disableClose: true,
        });
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                let userToModify;
                if (this.userData.isVet) {
                    userToModify = uid;
                } else {
                    userToModify = this.loggedInUser.uid;
                }
                this.firebaseCrudService
                    .updateUserAfterRequest(userToModify, '')
                    .then(() => {
                        this.snackbarService.openSnackBar(
                            'Leiratkozás sikeres!',
                            undefined,
                            {
                                duration: 3000,
                                panelClass: ['green-snackbar'],
                            }
                        );
                        this.relatedUsers = [];
                        this.listRelations();
                    })
                    .catch(() => {
                        this.snackbarService.openSnackBar(
                            'Művelet sikertelen!',
                            undefined,
                            {
                                duration: 3000,
                                panelClass: ['red-snackbar'],
                            }
                        );
                    });
            }
        });
    }
}
