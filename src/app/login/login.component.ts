import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { AuthService } from '../shared/auth.service';

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

  constructor(private fb: FormBuilder, private auth: AuthService) {}

  ngOnInit(): void {}

  login(){
    console.log(this.email);
    if (this.email === ''){
      alert('Please enter email!');
      return;
    }
    if (this.password === ''){
      alert('Please enter password!');
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
      alert('Please enter email!');
      return;
    }
    if (this.reg_password === ''){
      alert('Please enter password!');
      return;
    }
    if(this.reg_password !==  this.reg_password_again){
      alert('Passwords do not match!');
      return;
    }

    this.auth.register(this.reg_email,this.reg_password);
    this.email = '';
    this.password = '';
    this.reg_email = '';
    this.reg_password = '';
    this.reg_password_again = '';
  }

  logout(){
    this.auth.logout();
  }

}
