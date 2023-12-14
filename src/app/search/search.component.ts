import { Component, OnInit } from '@angular/core';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { getAuth } from 'firebase/auth';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NewRequestDialogComponent } from '../dialogs/new-request-dialog/new-request-dialog.component';
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    auth = getAuth();
    loggedIn: any;
    userData: any;
    vets = [];
    pets = [];
    filteredVets: any[] = [];
    filteredPets: any[] = [];
    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private router: Router,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.auth.onAuthStateChanged((user) => {
            this.loggedIn = user;
            this.loggedIn ? this.loadVets(true) : '';
            this.loadPets();
            this.firebaseCrudService
                .getUserData(this.loggedIn.uid)
                .then((user) => {
                    this.userData = user.data();
                });
        });
    }

    loadVets(vet: boolean): void {
        this.firebaseCrudService.getAllUsers(vet).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.vets.push({ id: doc.id, ...doc.data() });
            });
        });
    }

    loadPets(): void {
        this.firebaseCrudService.listAllPets().then((pets) => {
            this.pets = pets;
        });
    }

    applyVetFilter(event: Event): void {
        if (event) {
            const inputValue = (
                event.target as HTMLInputElement
            ).value.toLowerCase();

            if (inputValue.length === 0) {
                this.filteredVets = [];
                return;
            }

            this.filteredVets = this.vets.filter(
                (vet) =>
                    vet.name?.toLowerCase().includes(inputValue) ||
                    vet.email.toLowerCase().includes(inputValue)
            );
        }
    }
    applyPetFilter(event: Event): void {
        if (event) {
            const inputValue = (
                event.target as HTMLInputElement
            ).value.toLowerCase();

            if (inputValue.length === 0) {
                this.filteredPets = [];
                return;
            }

            this.filteredPets = this.pets.filter(
                (pet) =>
                    pet.name.toLowerCase().includes(inputValue) ||
                    pet.breed.toLowerCase().includes(inputValue)
            );
        }
    }

    viewPublicProfile(petId: string): void {
        this.router.navigate(['/pet-profile', petId]);
    }

    assignVet(vet: any) {
        this.dialog.open(NewRequestDialogComponent, {
            height: '360px',
            width: '600px',
            data: { ownerId: this.loggedIn.uid, vetId: vet.id },
        });
    }
}
