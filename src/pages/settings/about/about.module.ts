import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AboutPage } from './about';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

/* Read translation files */
export function createTranslateLoader(http: HttpClient) {
  return new TranslatePoHttpLoader(http, 'assets/i18n/po', '.po');
}

@NgModule({
  declarations: [
    AboutPage,
  ],
  imports: [
    IonicPageModule.forChild(AboutPage),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    })
  ],
})
export class AboutPageModule { }