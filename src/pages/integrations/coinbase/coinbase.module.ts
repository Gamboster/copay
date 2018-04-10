import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CoinbasePage } from './coinbase';

import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslatePoHttpLoader } from '@biesbjerg/ngx-translate-po-http-loader';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

import { PipesModule } from '../../../pipes/pipes.module';

/* Read translation files */
export function createTranslateLoader(http: HttpClient) {
  return new TranslatePoHttpLoader(http, 'assets/i18n/po', '.po');
}

@NgModule({
  declarations: [
    CoinbasePage
  ],
  imports: [
    IonicPageModule.forChild(CoinbasePage),
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
export class CoinbasePageModule { }