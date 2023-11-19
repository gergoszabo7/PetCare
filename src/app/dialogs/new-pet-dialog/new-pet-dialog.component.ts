import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Auth, getAuth } from 'firebase/auth';
import { Observable, ReplaySubject, map, startWith } from 'rxjs';
import { Breed } from 'src/app/models/breed.model';
import { Pet } from 'src/app/models/pet.model';
import { AuthService } from 'src/app/shared/auth.service';
import { FirebaseCrudService } from 'src/app/shared/firebase-crud.service';
import {UtilsService} from "../../shared/utils.service";

@Component({
    selector: 'app-new-pet-dialog',
    templateUrl: './new-pet-dialog.component.html',
    styleUrls: ['./new-pet-dialog.component.scss'],
})
export class NewPetDialogComponent {
    auth: Auth;
    user: string;
    breeds: Breed[] = [];
    filteredBreeds: Observable<Breed[]>;
    breedsLoaded = false;
    searchControl = this.fb.control('');
    formLoaded = false;
    pet: Pet;
    addPetForm: FormGroup;

    constructor(
        private authService: AuthService,
        private firebaseCrudService: FirebaseCrudService,
        private dialogRef: MatDialogRef<NewPetDialogComponent>,
        private http: HttpClient,
        private fb: FormBuilder,
        private utilsService: UtilsService,
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.http.get<Breed[]>('/assets/breeds.json').subscribe(
            (data) => {
                this.breeds = data;
                this.formLoaded = true;
                this.breedsLoaded = true;
                this.initializeForm();
                this.setupSearch();
            },
            (error) => console.error('Kutyafajták nem lekérdezhetők:', error)
        );
    }

    private initializeForm(): void {
        this.addPetForm = this.fb.group({
            name: ['', Validators.required],
            birth: [null, Validators.required],
            weight: [null, Validators.required],
            petType: [null, Validators.required],
            breed: [null, Validators.required],
            sex: [null, Validators.required],
            color: ['', Validators.required],
        });
    }

    private setupSearch(): void {
        this.filteredBreeds = this.searchControl.valueChanges.pipe(
            startWith(''),
            map((value) => this.filterBreeds(value))
        );
    }

    private filterBreeds(value: string | Breed): Breed[] {
        const filterValue =
            typeof value === 'string' ? value.toLowerCase() : '';

        return this.breeds.filter((breed) =>
            breed.viewValue.toLowerCase().includes(filterValue)
        );
    }

    addPet() {
        const birthValue = this.addPetForm.get('birth')?.value;
        const formattedBirthDate = this.utilsService.formatDate(birthValue);
        this.pet = {
            name: this.addPetForm.get('name')?.value,
            birth: new Date(formattedBirthDate),
            weight: this.addPetForm.get('weight')?.value,
            petType: this.addPetForm.get('petType')?.value,
            breed: this.addPetForm.get('breed')?.value,
            sex: this.addPetForm.get('sex')?.value,
            color: this.addPetForm.get('color')?.value,
            userId: this.auth.currentUser.uid,
        };
        console.log(this.pet);
        this.firebaseCrudService.createPet(this.pet);
        this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    onKey(value: any): void {
        this.breeds = this.search(value);
    }

    search(value: string) {
        const filter = value.toLowerCase();
        return this.breeds.filter((option) =>
            option.value.toLowerCase().includes(filter)
        );
    }
}
