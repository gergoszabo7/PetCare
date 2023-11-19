import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Pet } from '../../models/pet.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Auth } from 'firebase/auth';
import { AuthService } from '../../shared/auth.service';
import { FirebaseCrudService } from '../../shared/firebase-crud.service';
import { HttpClient } from '@angular/common/http';
import {ConfirmDialogComponent} from "../../dialogs/confirm-dialog/confirm-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Component({
    selector: 'app-view-pet',
    templateUrl: './view-pet.component.html',
    styleUrls: ['./view-pet.component.scss'],
})
export class ViewPetComponent implements OnInit {
    auth: Auth;
    updatePetForm: FormGroup;
    pet: Pet;
    petId;
    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private firebaseCrudService: FirebaseCrudService,
        private http: HttpClient,
        private fb: FormBuilder,
        private dialog: MatDialog,
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
            };
            this.petId = params['id'];
            this.initializeForm();
        });
    }

    updatePet(): void {
        this.firebaseCrudService.updatePet(this.petId, {
            name: this.updatePetForm.get('name')?.value,
            weight: this.updatePetForm.get('weight')?.value,
        });
    }

    deletePet(): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Háziállat törlése',
                message: 'Biztosan töröli ezt a háziállatot?',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.firebaseCrudService.deletePet(this.petId);
            }
        });
    }

    private initializeForm(): void {
        this.updatePetForm = this.fb.group({
            name: [this.pet.name, Validators.required],
            weight: [this.pet.weight ?? ''],
        });
    }
}
