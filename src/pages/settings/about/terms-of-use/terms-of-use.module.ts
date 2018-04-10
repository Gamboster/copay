import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { TermsOfUsePage } from './terms-of-use';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

/* Read translation files */
export function createTranslateLoader(http: HttpClient) {
  return new TranslatePoHttpLoader(http, 'assets/i18n/po', '.po');
}

@NgModule({
  declarations: [
    TermsOfUsePage,
  ],
  imports: [
    IonicPageModule.forChild(TermsOfUsePage),
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
export class TermsOfUsePageModule { }