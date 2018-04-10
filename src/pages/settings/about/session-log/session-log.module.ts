import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SessionLogPage } from './session-log';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../../../pipes/pipes.module';

/* Read translation files */
export function createTranslateLoader(http: HttpClient) {
  return new TranslatePoHttpLoader(http, 'assets/i18n/po', '.po');
}

@NgModule({
  declarations: [
    SessionLogPage
  ],
  imports: [
    IonicPageModule.forChild(SessionLogPage),
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient]
      }
    }),
    PipesModule
  ],
})
export class SessionLogPageModule { } 