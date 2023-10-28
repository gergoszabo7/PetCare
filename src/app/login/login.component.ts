import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { AuthService } from '../shared/auth.service';
import { SnackbarService } from '../shared/snackbar.service';
import {MatTabsModule} from '@angular/material/tabs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {

  email = '';
  password = '';
  reg_email = '';
  reg_password = '';
  reg_password_again = '';

  loginForm: FormGroup;

  constructor(private fb: FormBuilder, private auth: AuthService, private snackBarService: SnackbarService) {}

  ngOnInit(): void {}

  login(){
    if (this.email === ''){
      this.snackBarService.openSnackBar('Kérem írjon be e-mail címet!', undefined, { duration: 3000 ,panelClass: ['red-snackbar']});
      return;
    }
    if (this.password === ''){
      this.snackBarService.openSnackBar('Kérem írjon be jelszót!', undefined, { duration: 3000 ,panelClass: ['red-snackbar']});
      return;
    }

    this.auth.login(this.email,this.password);
    this.email = '';
    this.password = '';
    this.reg_email = '';
    this.reg_password = '';
    this.reg_password_again = '';
  }

  register(){
    if (this.reg_email === ''){
      this.snackBarService.openSnackBar('Kérem írjon be e-mail címet!', undefined, { duration: 3000 ,panelClass: ['red-snackbar']});
      return;
    }
    if (this.reg_password === ''){
      this.snackBarService.openSnackBar('Kérem írjon be jelszót!', undefined, { duration: 3000 ,panelClass: ['red-snackbar']});
      return;
    }
    if(this.reg_password !==  this.reg_password_again){
      this.snackBarService.openSnackBar('A jelszavaknak meg kell egyezniük', undefined, { duration: 3000 ,panelClass: ['red-snackbar']});
      return;
    }

    this.auth.register(this.reg_email,this.reg_password);
    this.email = '';
    this.password = '';
    this.reg_email = '';
    this.reg_password = '';
    this.reg_password_again = '';
  }
}
