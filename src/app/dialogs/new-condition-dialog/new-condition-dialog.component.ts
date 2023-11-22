import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Auth, getAuth } from 'firebase/auth';
import { Pet } from 'src/app/models/pet.model';
import { FirebaseCrudService } from 'src/app/shared/firebase-crud.service';
import { UtilsService } from '../../shared/utils.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
    selector: 'app-new-condition-dialog',
    templateUrl: './new-condition-dialog.component.html',
    styleUrls: ['./new-condition-dialog.component.scss'],
})
export class NewConditionDialogComponent implements OnInit {
    auth: Auth;
    user: string;
    pet: Pet;
    addConditionForm: FormGroup;

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private dialogRef: MatDialogRef<NewConditionDialogComponent>,
        private fb: FormBuilder,
        private utilsService: UtilsService,
        private snackbarService: SnackbarService
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.initializeForm();
    }

    private initializeForm(): void {
        this.addConditionForm = this.fb.group({
            condType: ['', Validators.required],
        });
        this.addConditionForm
            .get('condType')
            .valueChanges.subscribe((value) => {
                this.createDynamicFormControls(value);
            });
    }

    private createDynamicFormControls(conditionType: string): void {
        // Clear existing form controls
        Object.keys(this.addConditionForm.controls).forEach((key) => {
            if (key !== 'condType') {
                this.addConditionForm.removeControl(key);
            }
        });

        // Create form controls based on condition type
        if (conditionType === 'allergia') {
            this.addConditionForm.addControl(
                'allergyName',
                this.fb.control('', Validators.required)
            );
        } else if (conditionType === 'gyógyszer') {
            this.addConditionForm.addControl(
                'medicineName',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'medicineEndDate',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'medicineFreq',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'medicineFreqUnit',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'medicineDesc',
                this.fb.control('')
            );
        }
    }

    addCondition() {
        if (this.addConditionForm.invalid) {
            this.snackbarService.openSnackBar(
                'Kötelező mezőket ki kell tölteni!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        // const formattedBirthDate = this.utilsService.formatDate(
        //     this.addPetForm.get('birth')?.value
        // );
        // this.pet = {
        //     name: this.addPetForm.get('name')?.value,
        //     birth: formattedBirthDate,
        //     weight: this.addPetForm.get('weight')?.value,
        //     petType: this.addPetForm.get('petType')?.value,
        //     breed: this.addPetForm.get('breed')?.value,
        //     sex: this.addPetForm.get('sex')?.value,
        //     color: this.addPetForm.get('color')?.value,
        //     userId: this.auth.currentUser.uid,
        // };
        // this.firebaseCrudService.createPet(this.pet);
        // this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    getTypeValue(): string {
        return this.addConditionForm.get('condType')?.value;
    }
}
