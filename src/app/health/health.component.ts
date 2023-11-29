import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { Pet } from '../models/pet.model';
import { NewPetDialogComponent } from '../dialogs/new-pet-dialog/new-pet-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { NewConditionDialogComponent } from '../dialogs/new-condition-dialog/new-condition-dialog.component';
import { ConfirmDialogComponent } from '../dialogs/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-health',
    templateUrl: './health.component.html',
    styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit {
    auth: Auth;
    user: string;
    myPets = [];
    pet: Pet;
    petId = '';
    petWeight = 0;
    selectedPetId: string | null = null;
    allergies = [];
    medicines = [];
    examinations = [];
    protocols = [];
    todayDate = new Date();

    constructor(
        private firebaseCrudService: FirebaseCrudService,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        if (getAuth()) {
            this.auth = getAuth();
            this.user = this.auth.currentUser.email;
        }
        this.listPets();
    }

    addCondition() {
        const newCondDialog = this.dialog.open(NewConditionDialogComponent, {
            height: '780px',
            width: '400px',
            data: this.selectedPetId,
        });
        newCondDialog.afterClosed().subscribe(() => {
            this.showData(this.selectedPetId);
        });
    }

    listPets() {
        this.firebaseCrudService
            .listPetsForUser(this.auth.currentUser.uid)
            .then((result) => {
                result.docs.forEach((doc) => {
                    this.myPets.push({ id: doc.id, ...doc.data() });
                });
            });
    }

    showData(petId: string): void {
        this.petId = petId;
        this.selectedPetId = petId;
        this.getConditionsForPet(this.selectedPetId);
    }

    setWeight(pet: Pet) {
        this.petWeight = pet.weight;
    }

    getConditionsForPet(petId: string) {
        const conditions = [];
        this.firebaseCrudService.listConditionsForPet(petId).then((result) => {
            result.docs.forEach((doc) => {
                conditions.push({ id: doc.id, ...doc.data() });
            });
            this.allergies = conditions.filter(
                (item) => item.condType === 'allergia'
            );
            this.medicines = conditions.filter(
                (item) => item.condType === 'gyógyszer'
            );
            this.examinations = conditions.filter(
                (item) => item.condType === 'vizsgálat'
            );
            this.protocols = conditions.filter(
                (item) => item.condType === 'protokoll'
            );
        });
    }

    getNextDose(
        start: string,
        end: string,
        freq: number,
        fUnit: string
    ): string {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const currentDate = new Date();
        const daysSinceStart = Math.floor(
            (currentDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24)
        );

        if (currentDate > endDate) {
            return 'lezárult';
        }

        let nextDoseDate: Date;

        switch (fUnit) {
            case 'naponta':
                nextDoseDate = new Date(
                    startDate.getTime() +
                    Math.ceil((daysSinceStart + 1) / freq) * freq * 24 * 60 * 60 * 1000
                );
                break;
            case 'hetente':
                const daysUntilNextWeekday = freq - (daysSinceStart % freq);
                nextDoseDate = new Date(
                    startDate.getTime() +
                        daysUntilNextWeekday * 7 * 24 * 60 * 60 * 1000
                );
                break;
            case 'havonta':
                nextDoseDate = new Date(startDate);
                nextDoseDate.setMonth(
                    nextDoseDate.getMonth() + freq - (daysSinceStart % freq)
                );
                break;
            default:
                return 'Hibás időmértékegység';
        }

        if (nextDoseDate <= currentDate) {
            while (nextDoseDate <= currentDate) {
                switch (fUnit) {
                    case 'naponta':
                        nextDoseDate = new Date(
                            nextDoseDate.getTime() + freq * 24 * 60 * 60 * 1000
                        );
                        break;
                    case 'hetente':
                        nextDoseDate = new Date(
                            nextDoseDate.getTime() + 7 * freq * 24 * 60 * 60 * 1000
                        );
                        break;
                    case 'havonta':
                        nextDoseDate.setMonth(nextDoseDate.getMonth() + freq);
                        break;
                }
            }
        }

        const daysUntilNextDose = Math.floor(
            (nextDoseDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24)
        );

        if (daysUntilNextDose === 0) {
            return 'ma';
        } else if (daysUntilNextDose === 1) {
            return 'holnap';
        } else {
            return `${daysUntilNextDose} nap múlva`;
        }
    }

    getNextExamination(date: string): string {
        const dueDate = new Date(date);
        const currentDate = new Date();

        dueDate.setHours(0, 0, 0, 0);
        currentDate.setHours(0, 0, 0, 0);

        const daysUntilExamination = Math.floor(
            (dueDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysUntilExamination === 0) {
            return 'ma';
        } else if (daysUntilExamination === 1) {
            return 'holnap';
        } else if (daysUntilExamination > 0) {
            return `${daysUntilExamination} nap múlva`;
        } else {
            return '';
        }
    }

    deleteCondition(condId: string): void {
        const dialogRef = this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Állapot törlése',
                message: 'Biztosan töröli ezt az állapotot?',
            },
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.firebaseCrudService.deleteCondition(condId, () =>
                    this.showData(this.selectedPetId)
                );
            }
        });
    }
}
