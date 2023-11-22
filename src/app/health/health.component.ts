import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { Pet } from '../models/pet.model';
import {NewPetDialogComponent} from "../dialogs/new-pet-dialog/new-pet-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {NewConditionDialogComponent} from "../dialogs/new-condition-dialog/new-condition-dialog.component";

@Component({
    selector: 'app-health',
    templateUrl: './health.component.html',
    styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit {
    auth: Auth;
    user: string;
    myPets = [];
    pet: Pet;
    petId = '';
    selectedPetId: string | null = null;

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.listPets();
    }

    addCondition() {
        this.dialog.open(NewConditionDialogComponent, {
            height: '780px',
            width: '400px',
        });
    }

    listPets() {
        this.firebaseCrudService
            .listPetsForUser(this.auth.currentUser.uid)
            .then((result) => {
                result.docs.forEach((doc) => {
                    this.myPets.push({ id: doc.id, ...doc.data() });
                });
            });
    }

    showData(petId: string): void {
        this.petId = petId;
        this.selectedPetId = petId;
    }
}
