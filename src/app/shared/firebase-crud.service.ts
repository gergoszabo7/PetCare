import { Injectable } from '@angular/core';
import {
    collection,
    getFirestore,
    addDoc,
    getDocs,
    where,
    query,
    updateDoc,
    deleteDoc,
} from 'firebase/firestore';
import { Pet } from '../models/pet.model';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { doc } from '@angular/fire/firestore';

@Injectable({
    providedIn: 'root',
})
export class FirebaseCrudService {
    db = getFirestore();

    constructor(
        private snackbarService: SnackbarService,
        private router: Router
    ) {}

    listPetsForUser(uid: string) {
        const petsRef = collection(this.db, 'pets');
        const q = query(petsRef, where('userId', '==', uid));
        return getDocs(q);
    }

    createPet(pet: Pet) {
        const petsRef = collection(this.db, 'pets');
        addDoc(petsRef, pet).then(() => {
            this.snackbarService.openSnackBar(
                'Háziállat sikeresen hozzáadva!',
                undefined,
                { duration: 3000, panelClass: ['green-snackbar'] }
            );
        });
    }

    deletePet(petId: string) {
        const petDoc = doc(this.db, 'pets', petId);
        deleteDoc(petDoc).then(() => {
            this.snackbarService.openSnackBar('Háziállat törölve!', undefined, {
                duration: 3000,
                panelClass: ['green-snackbar'],
            });
            this.router.navigate(['overview/main-page']);
        });
    }

    updatePet(petId: string, data: { name: string; weight: number }) {
        const petDoc = doc(this.db, 'pets', petId);
        updateDoc(petDoc, { name: data.name, weight: data.weight }).then(() => {
            this.snackbarService.openSnackBar(
                'Háziállat sikeresen módosítva!',
                undefined,
                { duration: 3000, panelClass: ['green-snackbar'] }
            );
        });
    }

    createCondition(cond: any) {
        const condRef = collection(this.db, 'conditions');
        addDoc(condRef, cond).then(() => {
            this.snackbarService.openSnackBar(
                'Állapot sikeresen hozzáadva!',
                undefined,
                { duration: 3000, panelClass: ['green-snackbar'] }
            );
        });
    }

    listConditionsForPet(petId: string) {
        const condRef = collection(this.db, 'conditions');
        const q = query(condRef, where('petId', '==', petId));
        return getDocs(q);
    }
}
