import { Component, OnInit } from '@angular/core';
import { Auth, getAuth } from 'firebase/auth';
import { AuthService } from '../shared/auth.service';
import { Router } from '@angular/router';
import { Pet } from '../models/pet.model';
import { FirebaseCrudService } from '../shared/firebase-crud.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

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
    const formattedBirthDate = this.addPetForm.get('birth')?.value.toLocaleString().substring(0, 13);
    this.pet = {
      name: this.addPetForm.get('name')?.value,
      birth: formattedBirthDate,
      weight: this.addPetForm.get('weight')?.value,
      userId: this.auth.currentUser.uid
    }
    console.log(this.pet);
    this.firebaseCrudService.createPet(this.pet);
    this.addPetForm.reset();
  }

  listPets() {
    this.firebaseCrudService.listPetsForUser(this.auth.currentUser.uid).then((result) => {
      result.docs.forEach((doc) => {
        this.myPets.push({...doc.data()});
      })
    })
  }
}
