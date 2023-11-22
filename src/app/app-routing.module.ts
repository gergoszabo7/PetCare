import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { OverviewComponent } from './overview/main-page/overview.component';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login.guard';
import { ViewPetComponent } from './overview/view-pet/view-pet.component';
import {HealthComponent} from "./health/health.component";

const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
    {
        path: 'overview',
        canActivate: [AuthGuard],
        children: [
            {
                path: '',
                redirectTo: 'main-page',
                pathMatch: 'full',
            },
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
    { path: 'health', component: HealthComponent, canActivate: [AuthGuard] },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
})
export class AppRoutingModule {}
