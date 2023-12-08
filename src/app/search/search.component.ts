import { Component, OnInit } from '@angular/core';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit {
    vets = [];
    pets = [];
    filteredVets: any[] = [];
    filteredPets: any[] = [];
    constructor(private firebaseCrudService: FirebaseCrudService) {}

    ngOnInit(): void {
        this.loadVets(true);
        this.loadPets();
    }

    loadVets(vet: boolean): void {
        this.firebaseCrudService.getAllUsers(vet).then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.vets.push(doc.data());
            });
        });
    }

    loadPets(): void {
        this.firebaseCrudService.listAllPets().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                this.pets.push(doc.data());
            });
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
}
