import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Auth, getAuth } from 'firebase/auth';
import { Observable, ReplaySubject, map, startWith } from 'rxjs';
import { Breed } from 'src/app/models/breed.model';
import { Pet } from 'src/app/models/pet.model';
import { FirebaseCrudService } from 'src/app/shared/firebase-crud.service';
import { UtilsService } from '../../shared/utils.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
    selector: 'app-new-pet-dialog',
    templateUrl: './new-pet-dialog.component.html',
    styleUrls: ['./new-pet-dialog.component.scss'],
})
export class NewPetDialogComponent implements OnInit {
    auth: Auth;
    user: string;
    breeds: Breed[] = [];
    filteredBreeds: Observable<Breed[]>;
    breedsLoaded = false;
    searchControl = this.fb.control('');
    formLoaded = false;
    pet: Pet;
    userData: any;
    addPetForm: FormGroup;
    owners: { uid: string; email: string }[];

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private dialogRef: MatDialogRef<NewPetDialogComponent>,
        private http: HttpClient,
        private fb: FormBuilder,
        private utilsService: UtilsService,
        private snackbarService: SnackbarService
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
        this.getUserDataObject(this.auth.currentUser.uid);
        this.setAllOwners(this.auth.currentUser.uid);
    }

    private initializeForm(): void {
        this.addPetForm = this.fb.group({
            name: ['', Validators.required],
            birth: [null, Validators.required],
            weight: null,
            petType: [null, Validators.required],
            breed: [null, Validators.required],
            sex: [null, Validators.required],
            color: ['', Validators.required],
            owner: ['', Validators.required],
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
        if (this.addPetForm.invalid) {
            this.snackbarService.openSnackBar(
                'Kötelező mezőket ki kell tölteni!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        const formattedBirthDate = this.utilsService.formatDate(
            this.addPetForm.get('birth')?.value
        );
        this.pet = {
            name: this.addPetForm.get('name')?.value,
            birth: formattedBirthDate,
            weight: this.addPetForm.get('weight')?.value,
            petType: this.addPetForm.get('petType')?.value,
            breed: this.addPetForm.get('breed')?.value,
            sex: this.addPetForm.get('sex')?.value,
            color: this.addPetForm.get('color')?.value,
            userId: this.userData.data.isVet
                ? this.addPetForm.get('owner')?.value
                : this.auth.currentUser.uid,
        };
        this.firebaseCrudService.createPet(this.pet);
        this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    search(value: string) {
        const filter = value.toLowerCase();
        return this.breeds.filter((option) =>
            option.value.toLowerCase().includes(filter)
        );
    }

    async getUserDataObject(uid: string): Promise<any> {
        const userSnapshot = await this.firebaseCrudService.getUserData(uid);

        if (userSnapshot.exists()) {
            const uData = userSnapshot.data();
            this.userData = {
                id: userSnapshot.id,
                data: uData,
            };
        }
    }

    setAllOwners(uid: string): void {
        this.owners = [];

        this.firebaseCrudService
            .getAllUsers(false, uid)
            .then((querySnapshot) => {
                querySnapshot.forEach((userDoc) => {
                    const userData = userDoc.data();
                    const owner: { uid: string; email: string } = {
                        uid: userDoc.id,
                        email: userData['email'],
                    };
                    this.owners.push(owner);
                });
            });
    }
}
