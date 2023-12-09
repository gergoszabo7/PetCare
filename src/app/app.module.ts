import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './login/login.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { AngularFireModule } from '@angular/fire/compat';
import { OverviewComponent } from './overview/main-page/overview.component';
import { HeaderComponent } from './header/header.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DatePipe, registerLocaleData } from '@angular/common';
import localeHu from '@angular/common/locales/hu';
import { NewPetDialogComponent } from './dialogs/new-pet-dialog/new-pet-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { ViewPetComponent } from './overview/view-pet/view-pet.component';
import { ConfirmDialogComponent } from './dialogs/confirm-dialog/confirm-dialog.component';
import { HealthComponent } from './health/health.component';
import { NewConditionDialogComponent } from './dialogs/new-condition-dialog/new-condition-dialog.component';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SearchComponent } from './search/search.component';
import {MatPaginator, MatPaginatorModule} from '@angular/material/paginator';
import {MatTableModule} from "@angular/material/table";
import { FilterPipe } from './shared/filter.pipe';
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { BookComponent } from './book/book.component';
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import { PetProfileComponent } from './pet-profile/pet-profile.component';
import { NewRequestDialogComponent } from './dialogs/new-request-dialog/new-request-dialog.component';
import { ProfileComponent } from './profile/profile.component';

registerLocaleData(localeHu);
@NgModule({
    declarations: [
        AppComponent,
        LoginComponent,
        OverviewComponent,
        HeaderComponent,
        NewPetDialogComponent,
        NewConditionDialogComponent,
        ViewPetComponent,
        ConfirmDialogComponent,
        HealthComponent,
        NewConditionDialogComponent,
        SearchComponent,
        FilterPipe,
        BookComponent,
        PetProfileComponent,
        NewRequestDialogComponent,
        ProfileComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        AngularFireModule.initializeApp(environment.firebase),
        BrowserAnimationsModule,
        MatIconModule,
        MatDialogModule,
        MatFormFieldModule,
        MatSnackBarModule,
        MatInputModule,
        MatButtonModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatDividerModule,
        MatSelectModule,
        MatAutocompleteModule,
        MatTabsModule,
        MatCardModule,
        FormsModule,
        HttpClientModule,
        ReactiveFormsModule,
        provideFirebaseApp(() => initializeApp(environment.firebase)),
        provideAuth(() => getAuth()),
        provideFirestore(() => getFirestore()),
        MatListModule,
        MatChipsModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSlideToggleModule,
    ],
    exports: [RouterModule],
    providers: [
        AuthGuard,
        DatePipe,
        { provide: MAT_DATE_LOCALE, useValue: 'hu-HU' },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
