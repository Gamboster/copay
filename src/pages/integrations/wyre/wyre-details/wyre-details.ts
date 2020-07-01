import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { NavParams, ViewController } from 'ionic-angular';

// Providers
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
import { WyreProvider } from '../../../../providers/wyre/wyre';

@Component({
  selector: 'page-wyre-details',
  templateUrl: 'wyre-details.html'
})
export class WyreDetailsPage {
  public paymentRequest;

  constructor(
    private externalLinkProvider: ExternalLinkProvider,
    private logger: Logger,
    private navParams: NavParams,
    private popupProvider: PopupProvider,
    private wyreProvider: WyreProvider,
    private translate: TranslateService,
    private viewCtrl: ViewController
  ) {
    this.paymentRequest = this.navParams.data.paymentRequestData;
    this.paymentRequest.fiatBaseAmount =
      +this.paymentRequest.sourceAmount - +this.paymentRequest.fee;
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: WyreDetailsPage');
  }

  public remove() {
    const title = this.translate.instant('Removing Payment Request Data');
    const message = this.translate.instant(
      "The data of this payment request will be deleted. Make sure you don't need it"
    );
    const okText = this.translate.instant('Remove');
    const cancelText = this.translate.instant('Cancel');
    this.popupProvider
      .ionicConfirm(title, message, okText, cancelText)
      .then((res: boolean) => {
        if (res) {
          this.wyreProvider
            .saveWyre(this.paymentRequest, {
              remove: true
            })
            .then(() => {
              this.close();
            });
        }
      });
  }

  public openExternalLink(url: string) {
    this.externalLinkProvider.open(url);
  }

  public close() {
    this.viewCtrl.dismiss();
  }
}
