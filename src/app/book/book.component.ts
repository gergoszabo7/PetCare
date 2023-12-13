import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { Pet } from '../models/pet.model';
import { FormBuilder, FormGroup } from '@angular/forms';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { MatDialog } from '@angular/material/dialog';
import firebase from 'firebase/compat';
import QueryDocumentSnapshot = firebase.firestore.QueryDocumentSnapshot;

interface DisplayVac {
    date: string;
    name: string;
    petId: string;
    vetId: string;
    vetName?: string;
}

@Component({
    selector: 'app-book',
    templateUrl: './book.component.html',
    styleUrls: ['./book.component.scss'],
})
export class BookComponent implements OnInit {
    auth: Auth;
    user: string;
    myPets = [];
    pet: Pet;
    petId = '';
    selectedPetId: string | null = null;
    vaccinations: DisplayVac[] = [];
    userData: any;
    selectUserPets: FormGroup;
    owners: { uid: string; display: string }[];

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private dialog: MatDialog,
        private fb: FormBuilder
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.setAllOwners(this.auth.currentUser.uid);
        this.initializeForm();
        this.listPets();
        this.selectUserPets.valueChanges.subscribe(() => {
            this.myPets = [];
            this.listPets();
        });
    }

    initializeForm(): void {
        this.selectUserPets = this.fb.group({
            owner: [''],
        });
    }

    async listPets() {
        let uidForPets: string;
        const userSnapshot = await this.firebaseCrudService.getUserData(
            this.auth.currentUser.uid
        );

        if (userSnapshot.exists()) {
            const uData = userSnapshot.data();
            this.userData = {
                id: userSnapshot.id,
                data: uData,
            };
        }

        if (this.userData.data.isVet) {
            uidForPets = this.selectUserPets.get('owner')?.value;
        } else {
            uidForPets = this.auth.currentUser.uid;
        }

        this.firebaseCrudService.listPetsForUser(uidForPets).then((result) => {
            result.docs.forEach((doc) => {
                this.myPets.push({ id: doc.id, ...doc.data() });
            });
        });
    }

    setAllOwners(uid: string): void {
        this.owners = [];

        this.firebaseCrudService
            .getAllUsers(false, uid)
            .then((querySnapshot) => {
                querySnapshot.forEach((userDoc) => {
                    const userData = userDoc.data();
                    const owner: { uid: string; display: string } = {
                        uid: userDoc.id,
                        display: userData['name']
                            ? userData['name']
                            : userData['email'],
                    };
                    this.owners.push(owner);
                });
            });
    }

    showData(petId: string): void {
        this.petId = petId;
        this.selectedPetId = petId;
        this.getVaccinesForPet(this.selectedPetId);
    }

    getVaccinesForPet(petId: string) {
        this.vaccinations = [];
        this.firebaseCrudService
            .listVaccinesForPet(petId)
            .then((querySnapshot) => {
                const documentSnapshots: QueryDocumentSnapshot<unknown>[] =
                    querySnapshot.docs as unknown as QueryDocumentSnapshot<unknown>[];
                documentSnapshots.forEach((item, index) => {
                    this.vaccinations[index] = {
                        date: item.data()['date'],
                        name: item.data()['name'],
                        petId: item.data()['petId'],
                        vetId: item.data()['vetId'],
                    };
                    this.firebaseCrudService
                        .getUserData(item.data()['vetId'])
                        .then((userData) => {
                            this.vaccinations[index].vetName =
                                userData.data()['name'];
                        });
                });
            });
    }
}
