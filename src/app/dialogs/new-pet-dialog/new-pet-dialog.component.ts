import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Auth, getAuth } from 'firebase/auth';
import { Pet } from 'src/app/models/pet.model';
import { AuthService } from 'src/app/shared/auth.service';
import { FirebaseCrudService } from 'src/app/shared/firebase-crud.service';

@Component({
  selector: 'app-new-pet-dialog',
  templateUrl: './new-pet-dialog.component.html',
  styleUrls: ['./new-pet-dialog.component.scss']
})
export class NewPetDialogComponent {
  auth: Auth;
  user: string;
  myPets = [];
  pet: Pet;
  addPetForm: FormGroup;

  constructor(private authService: AuthService, 
    private firebaseCrudService: FirebaseCrudService,
    private dialogRef: MatDialogRef<NewPetDialogComponent>,
    private fb: FormBuilder){}

  ngOnInit(): void {
    if (getAuth()) {
      this.auth = getAuth();
      this.user = this.auth.currentUser.email;
    }
    this.addPetForm = this.fb.group({
      name: ['', Validators.required],
      birth: [null, Validators.required],
      weight: [null, Validators.required],
    })
  }

  addPet() {
    const formattedBirthDate = this.addPetForm.get('birth')?.value.toLocaleString().substring(0, 13);
    this.pet = {
      name: this.addPetForm.get('name')?.value,
      birth: formattedBirthDate,
      weight: this.addPetForm.get('weight')?.value,
      userId: this.auth.currentUser.uid
    }
    console.log(this.pet);
    this.firebaseCrudService.createPet(this.pet);
    this.closeDialog();
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
