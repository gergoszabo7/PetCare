import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { Pet } from '../models/pet.model';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { NewPetDialogComponent } from '../dialogs/new-pet-dialog/new-pet-dialog.component';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss']
})
export class OverviewComponent implements OnInit {
  auth: Auth;
  user: string;
  myPets = [];
  pet: Pet;
  addPetForm: FormGroup;

  constructor(private authService: AuthService, 
    private router: Router, 
    private firebaseCrudService: FirebaseCrudService,
    private dialog: MatDialog,
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
    this.listPets();
  }

  logout(){
    this.authService.logout();
  }

  addPet() {
    this.dialog.open(NewPetDialogComponent, {
      height: '500px',
      width: '350px',
    });
  }

  listPets() {
    this.firebaseCrudService.listPetsForUser(this.auth.currentUser.uid).then((result) => {
      result.docs.forEach((doc) => {
        this.myPets.push({...doc.data()});
      })
    })
  }
}
