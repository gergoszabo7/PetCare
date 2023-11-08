import { Injectable } from '@angular/core';
import { collection, getFirestore, addDoc, getDocs, where, query } from 'firebase/firestore';
import { Pet } from '../models/pet.model';
import { SnackbarService } from './snackbar.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class FirebaseCrudService {

  db = getFirestore();
 
  constructor(private snackbarService: SnackbarService, private router: Router) {}

  listPetsForUser(uid: string) {
    const petsRef = collection(this.db, 'pets');
    const q = query(petsRef, where('userId', '==', uid));
    return getDocs(q);
  }

  createPet(pet: Pet) {
    const petsRef = collection(this.db, 'pets');
    addDoc(petsRef , pet).then(() => {
      this.snackbarService.openSnackBar('Háziállat sikeresen hozzáadva!', undefined, { duration: 3000 ,panelClass: ['green-snackbar']});
    });
  }
}
