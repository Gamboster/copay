import { Component } from '@angular/core';
import { IonicPage } from 'ionic-angular';
import { Logger } from '../../../../providers/logger/logger';

@IonicPage()
@Component({
  selector: 'page-terms-of-use',
  templateUrl: 'terms-of-use.html',
})
export class TermsOfUsePage {

  constructor(
    private logger: Logger
  ) {
  }

  ionViewDidLoad() {
    this.logger.info('ionViewDidLoad TermsOfUsePage');
  }

}
