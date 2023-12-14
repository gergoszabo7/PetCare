import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseCrudService } from '../../shared/firebase-crud.service';
import { UtilsService } from '../../shared/utils.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
    selector: 'app-new-vaccination-dialog',
    templateUrl: './new-vaccination-dialog.component.html',
    styleUrls: ['./new-vaccination-dialog.component.scss'],
})
export class NewVaccinationDialogComponent implements OnInit {
    addVaccinationForm: FormGroup;
    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<NewVaccinationDialogComponent>,
        private firebaseCrudService: FirebaseCrudService,
        private utilsService: UtilsService,
        private snackbarService: SnackbarService,
        @Inject(MAT_DIALOG_DATA) public data: { petId: string; vetId: string }
    ) {}

    ngOnInit(): void {
        this.addVaccinationForm = this.fb.group({
            date: [new Date(), Validators.required],
            name: ['', [Validators.required, Validators.minLength(10)]],
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    addVaccination(): void {
        if (this.addVaccinationForm.invalid) {
            this.snackbarService.openSnackBar(
                'Kötelező mezőket helyesen ki kell tölteni!',
                undefined,
                { duration: 3000, panelClass: ['yellow-snackbar'] }
            );
            return;
        }
        const vaccination = {
            date: this.utilsService.formatDate(
                this.addVaccinationForm.get('date')?.value
            ),
            name: this.addVaccinationForm.get('name')?.value,
            petId: this.data.petId,
            vetId: this.data.vetId,
        };
        this.firebaseCrudService.addVaccinations(vaccination);
        this.closeDialog();
    }
}
