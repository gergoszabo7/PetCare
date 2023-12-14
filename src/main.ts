import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { initializeApp } from 'firebase/app';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const firebaseConfig = environment.firebase;
const app = initializeApp(firebaseConfig);

platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
