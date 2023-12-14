import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FirebaseCrudService } from '../../shared/firebase-crud.service';
import { SnackbarService } from '../../shared/snackbar.service';

@Component({
    selector: 'app-new-request-dialog',
    templateUrl: './new-request-dialog.component.html',
    styleUrls: ['./new-request-dialog.component.scss'],
})
export class NewRequestDialogComponent implements OnInit {
    requestForm: FormGroup;
    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<NewRequestDialogComponent>,
        private firebaseCrudService: FirebaseCrudService,
        private snackbarService: SnackbarService,
        @Inject(MAT_DIALOG_DATA) public data: { ownerId: string; vetId: string }
    ) {}

    ngOnInit(): void {
        this.requestForm = this.fb.group({
            message: [''],
        });
    }

    closeDialog() {
        this.dialogRef.close();
    }

    async requestVet(): Promise<void> {
        try {
            const existingReq = await this.firebaseCrudService.getRequests(
                undefined,
                this.data.ownerId
            );

            if (existingReq.size > 0) {
                this.snackbarService.openSnackBar(
                    'Már van folyamatban kérelem állatorvos felé!',
                    undefined,
                    {
                        duration: 4000,
                        panelClass: ['red-snackbar'],
                    }
                );
                this.closeDialog();
                return;
            }

            const request = {
                ownerId: this.data.ownerId,
                vetId: this.data.vetId,
                message: this.requestForm.get('message')?.value,
            };

            await this.firebaseCrudService.createRequest(request);
            this.closeDialog();
        } catch (error) {
            console.error('Error requesting vet:', error);
        }
    }
}
