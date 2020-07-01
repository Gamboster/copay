import { Component } from '@angular/core';
import { ModalController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';

// Pages
import { SimplexDetailsPage } from '../../integrations/simplex/simplex-details/simplex-details';
import { WyreDetailsPage } from '../../integrations/wyre/wyre-details/wyre-details';

// Providers
import { ConfigProvider } from '../../../providers/config/config';
import { HomeIntegrationsProvider } from '../../../providers/home-integrations/home-integrations';
import { Logger } from '../../../providers/logger/logger';
import { SimplexProvider } from '../../../providers/simplex/simplex';
import { WyreProvider } from '../../../providers/wyre/wyre';

@Component({
  selector: 'page-crypto-settings',
  templateUrl: 'crypto-settings.html'
})
export class CryptoSettingsPage {
  private serviceName: string = 'buycrypto';

  public showInHome;
  public service;
  public loading: boolean;
  public simplexPaymentRequests: any[];
  public wyrePaymentRequests: any[];

  constructor(
    private configProvider: ConfigProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private logger: Logger,
    private simplexProvider: SimplexProvider,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private wyreProvider: WyreProvider
  ) {
    this.service = _.filter(this.homeIntegrationsProvider.get(), {
      name: this.serviceName
    });
    this.showInHome = !!this.service[0].show;
  }

  ionViewWillEnter() {
    this.loading = true;

    this.initSimplex();
    this.initWyre();
  }

  private initSimplex() {
    this.simplexProvider
      .getSimplex()
      .then(simplexData => {
        if (
          !_.isEmpty(this.navParams.data) &&
          this.navParams.data.paymentId &&
          simplexData[this.navParams.data.paymentId]
        ) {
          simplexData[this.navParams.data.paymentId].status =
            this.navParams.data.success === 'true' ? 'success' : 'failed';
          this.simplexProvider
            .saveSimplex(simplexData[this.navParams.data.paymentId], null)
            .catch(() => {
              this.logger.warn('Could not update payment request status');
            });
        }

        const simplexPaymentRequests: any = {};
        Object.assign(simplexPaymentRequests, simplexData);
        this.simplexPaymentRequests = Object.values(simplexPaymentRequests);
        this.loading = false;
      })
      .catch(err => {
        this.loading = false;
        if (err) this.logger.error(err);
      });
  }

  private initWyre() {
    this.wyreProvider
      .getWyre()
      .then(wyreData => {
        if (!_.isEmpty(this.navParams.data) && this.navParams.data.transferId) {
          this.logger.info(
            '========= data: ',
            JSON.stringify(this.navParams.data)
          );
          console.log('========= data: ', JSON.stringify(this.navParams.data));

          this.wyreProvider
            .getTransfer(this.navParams.data.transferId)
            .then((transferData: any) => {
              wyreData[this.navParams.data.transferId].status = 'success';
              wyreData[this.navParams.data.transferId].sourceAmount =
                transferData.sourceAmount;
              wyreData[this.navParams.data.transferId].fee = transferData.fee; // Total fee (crypto fee + Wyre fee)
              wyreData[this.navParams.data.transferId].destCurrency =
                transferData.destCurrency;
              wyreData[this.navParams.data.transferId].sourceCurrency =
                transferData.sourceCurrency;

              this.setWyrePaymentRequests(wyreData);

              this.wyreProvider
                .saveWyre(wyreData[this.navParams.data.transferId], null)
                .then(() => {
                  this.logger.debug(
                    'Saved Wyre with transferId: ' +
                      this.navParams.data.transferId
                  );
                })
                .catch(() => {
                  this.logger.warn('Could not update payment request status');
                });
            })
            .catch(err => {
              this.showError(err);
            });
        } else {
          this.setWyrePaymentRequests(wyreData);
        }
      })
      .catch(err => {
        this.loading = false;
        if (err) this.logger.error(err);
      });
  }

  private setWyrePaymentRequests(wyreData: any) {
    const wyrePaymentRequests: any = {};
    Object.assign(wyrePaymentRequests, wyreData);
    this.wyrePaymentRequests = Object.values(wyrePaymentRequests);
    this.loading = false;
  }

  public showInHomeSwitch(): void {
    let opts = {
      showIntegration: { [this.serviceName]: this.showInHome }
    };
    this.homeIntegrationsProvider.updateConfig(
      this.serviceName,
      this.showInHome
    );
    this.configProvider.set(opts);
  }

  public openSimplexModal(paymentRequestData) {
    const modal = this.modalCtrl.create(SimplexDetailsPage, {
      paymentRequestData
    });

    modal.present();

    modal.onDidDismiss(() => {
      this.initSimplex();
    });
  }

  public openWyreModal(paymentRequestData) {
    const modal = this.modalCtrl.create(WyreDetailsPage, {
      paymentRequestData
    });

    modal.present();

    modal.onDidDismiss(() => {
      this.initWyre();
    });
  }

  public showError(err) {
    console.log('======== Wyre showError: ', err);
  }
}
