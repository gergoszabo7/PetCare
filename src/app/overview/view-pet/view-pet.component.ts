import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseCrudService } from '../../shared/firebase-crud.service';
import { ConfirmDialogComponent } from '../../dialogs/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
    selector: 'app-view-pet',
    templateUrl: './view-pet.component.html',
    styleUrls: ['./view-pet.component.scss'],
})
export class ViewPetComponent implements OnInit {
    auth: Auth;
    updatePetForm: FormGroup;
    pet: Pet;
    petId: string;
    showButton = true;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private firebaseCrudService: FirebaseCrudService,
        private fb: FormBuilder,
        private dialog: MatDialog,
        private snackbarService: SnackbarService
    ) {}
    ngOnInit(): void {
        this.route.params.subscribe((params) => {
            this.pet = {
                name: params['name'],
                birth: params['birth'],
                weight: +params['weight'],
                petType: params['petType'],
                breed: params['breed'],
                sex: params['sex'],
                color: params['color'],
                userId: params['userId'],
                isPublic: params['isPublic'] === 'true',
            };
            this.petId = params['id'];
            this.initializeForm();
        });
    }

    updatePet(): void {
        this.firebaseCrudService
            .updatePet(this.petId, {
                name: this.updatePetForm.get('name')?.value,
                weight: this.updatePetForm.get('weight')?.value,
                isPublic: this.updatePetForm.get('isPublic')?.value,
            })
            .then(() => {
                this.snackbarService.openSnackBar(
                    'Háziállat sikeresen módosítva!',
                    undefined,
                    { duration: 3000, panelClass: ['green-snackbar'] }
                );
                this.router.navigate(['overview/main-page']);
            });
    }

    deletePet(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Háziállat törlése',
                message: 'Biztosan töröli ezt a háziállatot?',
            },
            disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.firebaseCrudService.deletePet(this.petId);
            }
        });
    }

    viewPublicProfile(): void {
        this.router.navigate(['/pet-profile', this.petId]);
    }

    private initializeForm(): void {
        this.updatePetForm = this.fb.group({
            name: [this.pet.name, Validators.required],
            weight: [this.pet.weight ?? ''],
            isPublic: [this.pet.isPublic],
        });
    }
}
