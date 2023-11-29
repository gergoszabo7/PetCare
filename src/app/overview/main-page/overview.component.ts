import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { FirebaseCrudService } from '../../shared/firebase-crud.service';
import { MatDialog } from '@angular/material/dialog';
import { NewPetDialogComponent } from '../../dialogs/new-pet-dialog/new-pet-dialog.component';
import { UtilsService } from '../../shared/utils.service';

@Component({
    selector: 'app-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.scss'],
})
export class OverviewComponent implements OnInit {
    auth: Auth;
    user: string;
    myPets = [];
    pet: Pet;
    todos = [];

    constructor(
        private router: Router,
        private firebaseCrudService: FirebaseCrudService,
        private dialog: MatDialog,
        private utilsService: UtilsService
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.listPets();
    }

    addPet() {
        this.dialog.open(NewPetDialogComponent, {
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
                    this.listToDosForPet(doc.id);
                });
            });
    }

    getPetAge(birth: string): { age: number; time: string } {
        const currentDate = new Date();
        const givenDate = new Date(birth);
        const dateDifferenceInMillis =
            currentDate.getTime() - givenDate.getTime();
        if (
            Math.floor(
                dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 365.25)
            ) >= 1
        ) {
            return {
                age: Math.floor(
                    dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 365.25)
                ),
                time: 'év',
            };
        } else if (
            Math.floor(
                dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 30.44)
            ) >= 1
        ) {
            return {
                age: Math.floor(
                    dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 30.44)
                ),
                time: 'hónap',
            };
        } else if (
            Math.floor(dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 7)) >= 1
        ) {
            return {
                age: Math.floor(
                    dateDifferenceInMillis / (1000 * 60 * 60 * 24 * 7)
                ),
                time: 'hét',
            };
        } else {
            return { age: undefined, time: 'újszülött' };
        }
    }

    editPet(pet: Pet): void {
        this.router.navigate(['overview/view-pet', pet]);
    }

    listToDosForPet(petId: string): void {
        const toDo = [];
        this.firebaseCrudService
            .listConditionsForPetAndToDo(petId)
            .then((result) => {
                for (let i = 0; i < Math.min(result.length, 3); i++) {
                    const doc = result[i];
                    toDo.push({ id: doc.id, ...doc });
                }
            });
        this.todos[petId] = toDo;
    }

    transformDate(date: Date): string {
        return this.utilsService.formatDate(date);
    }
}
