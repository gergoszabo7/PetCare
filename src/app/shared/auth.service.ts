import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { WelcomeDialogComponent } from '../dialogs/welcome-dialog/welcome-dialog.component';

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(
        private fireauth: AngularFireAuth,
        private router: Router,
        private firestore: AngularFirestore,
        private dialog: MatDialog
    ) {}

    login(email: string, password: string) {
        this.fireauth.signInWithEmailAndPassword(email, password).then(
            () => {
                localStorage.setItem('token', 'true');
                this.router.navigate(['/overview/main-page']);
            },
            (err) => {
                alert('Sikertelen bejelentkezés!');
            }
        );
    }

    register(email: string, password: string, isVet: boolean) {
        this.fireauth.createUserWithEmailAndPassword(email, password).then(
            (userCredential) => {
                const uid = userCredential.user.uid;

                this.firestore
                    .collection('users')
                    .doc(uid)
                    .set({
                        isVet: isVet,
                        email: email,
                    })
                    .then(() => {
                        this.router.navigate(['/overview/']);
                        this.dialog.open(WelcomeDialogComponent, {
                            width: '480px',
                            height: '600px',
                            disableClose: true,
                        });
                    })
                    .catch((err) => {
                        console.error('Error creating user document:', err);
                        alert('Sikertelen regisztráció!');
                    });
            },
            (err) => {
                console.error('Error creating user:', err);
                alert('Sikertelen regisztráció!');
            }
        );
    }

    logout() {
        this.fireauth.signOut().then(
            () => {
                localStorage.removeItem('token');
                this.router.navigate(['/login']);
            },
            (err) => {
                alert(err.message);
            }
        );
    }
}
