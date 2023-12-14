import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
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
        private snackbarService: SnackbarService,
        private utilsService: UtilsService,
        @Inject(MAT_DIALOG_DATA) public data: string
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
        Object.keys(this.addConditionForm.controls).forEach((key) => {
            if (key !== 'condType') {
                this.addConditionForm.removeControl(key);
            }
        });

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
                'medicineStartDate',
                this.fb.control(new Date(), Validators.required)
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
        } else if (conditionType === 'protokoll') {
            this.addConditionForm.addControl(
                'protocolName',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'protocolStartDate',
                this.fb.control(new Date(), Validators.required)
            );
            this.addConditionForm.addControl(
                'protocolFreq',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'protocolFreqUnit',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'protocolDesc',
                this.fb.control('')
            );
        } else if (conditionType === 'vizsgálat') {
            this.addConditionForm.addControl(
                'examinationName',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'dueDate',
                this.fb.control('', Validators.required)
            );
            this.addConditionForm.addControl(
                'examinationDesc',
                this.fb.control('')
            );
        }
    }

    addCondition() {
        if (this.addConditionForm.invalid) {
            this.snackbarService.openSnackBar(
                'Kötelező mezőket helyesen ki kell tölteni!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        const dialogData = {
            ...this.addConditionForm.value,
            petId: this.data,
        };
        if (
            this.addConditionForm.get('medicineEndDate') &&
            this.addConditionForm.get('medicineStartDate')
        ) {
            dialogData.medicineEndDate = this.utilsService.formatDate(
                dialogData.medicineEndDate
            );
            dialogData.medicineStartDate = this.utilsService.formatDate(
                dialogData.medicineStartDate
            );
        } else if (this.addConditionForm.get('dueDate')) {
            dialogData.dueDate = this.utilsService.formatDate(
                dialogData.dueDate
            );
        } else if (this.addConditionForm.get('protocolStartDate')) {
            dialogData.protocolStartDate = this.utilsService.formatDate(
                dialogData.protocolStartDate
            );
        }
        this.firebaseCrudService.createCondition(dialogData);
        this.closeDialog();
    }

    closeDialog() {
        this.dialogRef.close();
    }

    getTypeValue(): string {
        return this.addConditionForm.get('condType')?.value;
    }
}
