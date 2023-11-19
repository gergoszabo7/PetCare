import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/main-page/overview.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { ViewPetComponent } from './overview/view-pet/view-pet.component';

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    {
        path: 'overview',
        canActivate: [AuthGuard],
        children: [
            {
                path: 'view-pet',
                component: ViewPetComponent,
            },
            {
                path: 'main-page',
                component: OverviewComponent,
            },
        ],
    },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
