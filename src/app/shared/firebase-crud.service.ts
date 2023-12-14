import { Injectable } from '@angular/core';
import {
    addDoc,
    collection,
    deleteDoc,
    getDocs,
    getFirestore,
    query,
    updateDoc,
    where,
} from 'firebase/firestore';
import { Pet } from '../models/pet.model';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';
import { doc, getDoc } from '@angular/fire/firestore';

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

    listAllPets() {
        const petsRef = collection(this.db, 'pets');
        const q = query(petsRef);
        return getDocs(q).then((querySnapshot) => {
            return querySnapshot.docs.map((doc) => {
                return { petId: doc.id, ...doc.data() };
            });
        });
    }

    async getPet(petId: string): Promise<any> {
        const petDocRef = doc(this.db, 'pets', petId);
        const snapshot = await getDoc(petDocRef);

        if (snapshot.exists()) {
            const petData = snapshot.data();
            return {
                ...petData,
            };
        } else {
            return null;
        }
    }

    createPet(pet: Pet) {
        const petsRef = collection(this.db, 'pets');
        addDoc(petsRef, pet)
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Háziállat sikeresen hozzáadva!',
                    undefined,
                    { duration: 3000, panelClass: ['green-snackbar'] }
                );
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Rendszerhiba, kérjük próbálkozzon később!',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
            });
    }

    deletePet(petId: string) {
        const petDoc = doc(this.db, 'pets', petId);
        deleteDoc(petDoc)
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Háziállat törölve!',
                    undefined,
                    {
                        duration: 3000,
                        panelClass: ['green-snackbar'],
                    }
                );
                this.router.navigate(['overview/main-page']);
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Rendszerhiba, kérjük próbálkozzon később!',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
            });
    }

    updatePet(
        petId: string,
        data: { name: string; weight: number; isPublic: boolean }
    ) {
        const petDoc = doc(this.db, 'pets', petId);
        return updateDoc(petDoc, {
            name: data.name,
            weight: data.weight,
            isPublic: data.isPublic,
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

    listConditionsForPetAndToDo(petId: string) {
        const condRef = collection(this.db, 'conditions');
        const q = query(
            condRef,
            where('petId', '==', petId),
            where('condType', '!=', 'allergia')
        );

        return getDocs(q).then((querySnapshot) => {
            const conditionsWithDueDate: any[] = [];

            querySnapshot.forEach((doc) => {
                const condType = doc.data()['condType'];

                let dueDate;
                if (condType === 'gyógyszer') {
                    const startDate = new Date(doc.data()['medicineStartDate']);
                    const freq = doc.data()['medicineFreq'];
                    const freqUnit = doc.data()['medicineFreqUnit'];

                    dueDate = this.getNextDose(startDate, freq, freqUnit);
                } else if (condType === 'protokoll') {
                    const startDate = new Date(doc.data()['protocolStartDate']);
                    const freq = doc.data()['protocolFreq'];
                    const freqUnit = doc.data()['protocolFreqUnit'];

                    dueDate = this.getNextDose(startDate, freq, freqUnit);
                } else if (condType === 'vizsgálat') {
                    dueDate = new Date(doc.data()['dueDate']);
                }

                const docWithDueDate = {
                    id: doc.id,
                    ...doc.data(),
                    dueDate,
                };
                conditionsWithDueDate.push(docWithDueDate);
            });

            conditionsWithDueDate.sort((a, b) =>
                a.dueDate < b.dueDate ? -1 : 1
            );
            return conditionsWithDueDate.filter((item) => {
                const dueDate = new Date(item.dueDate);
                const daysDifference = Math.floor(
                    (dueDate.getTime() - new Date().getTime()) /
                        (24 * 60 * 60 * 1000)
                );

                return daysDifference <= 90;
            });
        });
    }

    getNextDose(startDate: Date, freq: number, freqUnit: string): Date {
        const currentDate = new Date();
        let nextDoseDate;

        switch (freqUnit) {
            case 'naponta':
                nextDoseDate = new Date(startDate);
                nextDoseDate.setDate(nextDoseDate.getDate() + freq);
                break;
            case 'hetente':
                nextDoseDate = new Date(startDate);
                nextDoseDate.setDate(nextDoseDate.getDate() + freq * 7);
                break;
            case 'havonta':
                nextDoseDate = new Date(startDate);
                nextDoseDate.setMonth(nextDoseDate.getMonth() + freq);
                break;
        }

        if (nextDoseDate <= currentDate) {
            return this.getNextDose(nextDoseDate, freq, freqUnit);
        }

        return nextDoseDate;
    }

    deleteCondition(condId: string, callback?: () => void) {
        const condDoc = doc(this.db, 'conditions', condId);
        deleteDoc(condDoc)
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Állapot törölve!',
                    undefined,
                    {
                        duration: 3000,
                        panelClass: ['green-snackbar'],
                    }
                );
                callback();
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Rendszerhiba, kérjük próbálkozzon később!',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
            });
    }

    getUserData(uid: string) {
        const userRef = doc(this.db, 'users', uid);
        return getDoc(userRef);
    }

    getAllUsers(vet: boolean, vetId?: string) {
        const userRef = collection(this.db, 'users');
        let q = query(userRef, where('isVet', '==', vet));
        if (vetId) {
            q = query(
                userRef,
                where('isVet', '==', vet),
                where('vet', '==', vetId)
            );
        }
        return getDocs(q);
    }

    createRequest(request: any) {
        const requestRef = collection(this.db, 'requests');
        addDoc(requestRef, request)
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Kérelem elküldve!',
                    undefined,
                    {
                        duration: 3000,
                        panelClass: ['green-snackbar'],
                    }
                );
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Rendszerhiba, kérjük próbálkozzon később!',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
            });
    }

    getRequests(vetId?: string, ownerId?: string) {
        const reqRef = collection(this.db, 'requests');
        let q = null;
        if (ownerId) {
            q = query(reqRef, where('ownerId', '==', ownerId));
        } else {
            q = query(reqRef, where('vetId', '==', vetId));
        }
        return getDocs(q);
    }

    updateUser(
        uid: string,
        data: { email: string; name: string; mobile: string }
    ) {
        const userDoc = doc(this.db, 'users', uid);
        updateDoc(userDoc, {
            email: data.email,
            name: data.name,
            mobile: data.mobile,
        })
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Felhasználói adatok sikeresen módosítva!',
                    undefined,
                    { duration: 3000, panelClass: ['green-snackbar'] }
                );
            })
            .catch(() => {
                this.snackbarService.openSnackBar('Hibás adatok!', undefined, {
                    duration: 3000,
                    panelClass: ['red-snackbar'],
                });
            });
    }

    deleteRequest(reqId: string, callback?: () => void) {
        const reqDoc = doc(this.db, 'requests', reqId);
        deleteDoc(reqDoc).then(() => {
            callback();
        });
    }

    updateUserAfterRequest(uid: string, vetId: string) {
        const userDoc = doc(this.db, 'users', uid);
        return updateDoc(userDoc, {
            vet: vetId,
        });
    }

    listVaccinesForPet(petId: string) {
        const vacRef = collection(this.db, 'vaccinations');
        const q = query(vacRef, where('petId', '==', petId));
        return getDocs(q);
    }

    addVaccinations(vaccination: any) {
        const vacRef = collection(this.db, 'vaccinations');
        addDoc(vacRef, vaccination)
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Vakcina sikeresen rögzítve!',
                    undefined,
                    { duration: 3000, panelClass: ['green-snackbar'] }
                );
            })
            .catch(() => {
                this.snackbarService.openSnackBar(
                    'Rendszerhiba, kérjük próbálkozzon később!',
                    undefined,
                    { duration: 3000, panelClass: ['red-snackbar'] }
                );
            });
    }

    deleteVaccine(vacId: string, callback?: () => void) {
        const vacDoc = doc(this.db, 'vaccinations', vacId);
        deleteDoc(vacDoc).then(() => {
            callback();
        });
    }

    getRelatedUsers(uid: string) {
        const userRef = collection(this.db, 'users');
        const q = query(userRef, where('vet', '==', uid));
        return getDocs(q);
    }
}
