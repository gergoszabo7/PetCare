import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { Pet } from '../models/pet.model';

@Component({
    selector: 'app-pet-profile',
    templateUrl: './pet-profile.component.html',
    styleUrls: ['./pet-profile.component.scss'],
})
export class PetProfileComponent implements OnInit {
    petId: string;
    loading = true;
    pet: Pet;
    user: any;
    constructor(
        private route: ActivatedRoute,
        private firebaseCrudService: FirebaseCrudService
    ) {}

    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.petId = params['petId'];
            this.firebaseCrudService.getPet(this.petId).then((pet) => {
                if (pet) {
                    this.pet = pet;
                    if (!this.pet.isPublic) {
                        this.pet = null;
                    }
                    this.loading = false;
                } else {
                    this.pet = null;
                    this.loading = false;
                }
                this.getUserData(pet.userId);
            });
        });
    }

    getUserData(id: string): void {
        this.firebaseCrudService.getUserData(id).then((userSnapshot) => {
            if (userSnapshot.exists()) {
                this.user = {
                    id: userSnapshot.id,
                    ...userSnapshot.data(),
                };
            }
        });
    }
}
