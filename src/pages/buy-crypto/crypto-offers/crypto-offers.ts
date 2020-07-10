import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import * as _ from 'lodash';

// Providers
import { AppProvider } from '../../../providers/app/app';
import { BuyCryptoProvider } from '../../../providers/buy-crypto/buy-crypto';
import { ConfigProvider } from '../../../providers/config/config';
import { Coin, CurrencyProvider } from '../../../providers/currency/currency';
import { ExternalLinkProvider } from '../../../providers/external-link/external-link';
import { Logger } from '../../../providers/logger/logger';
import { ProfileProvider } from '../../../providers/profile/profile';
import { SimplexProvider } from '../../../providers/simplex/simplex';
import { WalletProvider } from '../../../providers/wallet/wallet';
import { WyreProvider } from '../../../providers/wyre/wyre';

// Pages
import { SimplexBuyPage } from '../../../pages/integrations/simplex/simplex-buy/simplex-buy';
@Component({
  selector: 'page-crypto-offers',
  templateUrl: 'crypto-offers.html'
})
export class CryptoOffersPage {
  public wallet: any;
  public walletId: any;
  public coin: Coin;
  public paymentMethod: any;
  public country: string;
  public currency: string;
  public currencies;
  public amount: any;
  public fiatCurrency: any;

  // Simplex
  public sShowOffer: boolean;
  public sFiatMoney;
  public sAmountReceiving;
  public sAmountLimits;
  public sErrorMsg: string;

  // Wyre
  public wShowOffer: boolean;
  public wFiatMoney;
  public wAmountReceiving;

  constructor(
    private appProvider: AppProvider,
    private buyCryptoProvider: BuyCryptoProvider,
    private logger: Logger,
    private navParams: NavParams,
    private simplexProvider: SimplexProvider,
    private navCtrl: NavController,
    private profileProvider: ProfileProvider,
    private currencyProvider: CurrencyProvider,
    private configProvider: ConfigProvider,
    private walletProvider: WalletProvider,
    private wyreProvider: WyreProvider,
    private externalLinkProvider: ExternalLinkProvider
  ) {
    this.currencies = this.simplexProvider.supportedCoins;
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: CryptoOffersPage');
  }

  ionViewWillEnter() {
    this.amount = this.navParams.data.amount;
    this.currency = this.navParams.data.currency;
    this.paymentMethod = this.navParams.data.paymentMethod;
    this.coin = this.navParams.data.coin;
    this.walletId = this.navParams.data.walletId;
    this.wallet = this.profileProvider.getWallet(this.walletId);
    this.setFiatCurrency();
    this.sShowOffer = this.buyCryptoProvider.isPaymentMethodSupported(
      'simplex',
      this.paymentMethod,
      this.coin,
      this.currency
    );
    this.wShowOffer = this.buyCryptoProvider.isPaymentMethodSupported(
      'wyre',
      this.paymentMethod,
      this.coin,
      this.currency
    );
    if (this.sShowOffer) this.getSimplexQuote();
    if (this.wShowOffer) this.getWyreQuote();
  }

  public goToSimplexBuyPage() {
    const params = {
      amount: this.amount,
      currency: this.currency,
      paymentMethod: this.paymentMethod,
      coin: this.coin,
      walletId: this.walletId
    };
    this.navCtrl.push(SimplexBuyPage, params);
  }

  public goToWyreBuyPage() {
    this.walletProvider
      .getAddress(this.wallet, false)
      .then(address => {
        let paymentMethod: string;
        switch (this.paymentMethod.method) {
          case 'applePay':
            paymentMethod = 'apple-pay';
            break;
          default:
            paymentMethod = 'debit-card';
            break;
        }
        console.log('---- paymentMethod: ', paymentMethod);

        const redirectUrl = this.appProvider.info.name + '://wyre';
        const failureRedirectUrl = this.appProvider.info.name + '://wyreError';
        const data = {
          amount: this.amount.toString(),
          dest: 'bitcoin:' + address,
          destCurrency: this.coin.toUpperCase(),
          sourceCurrency: this.currency.toUpperCase()
        };

        this.wyreProvider
          .walletOrderReservation(this.wallet, data)
          .then(data => {
            if (data && data.exceptionId) {
              this.logger.error(JSON.stringify(data));
              this.showError(data.message);
              return;
            }

            if (data && data.error && !_.isEmpty(data.error)) {
              this.showError(data.error);
              return;
            }

            console.log('-------- goToWyreBuyPage data success: ', data);
            console.log('============= wyre URL: ', data.url);
            const url =
              data.url +
              '&paymentMethod=' +
              paymentMethod +
              '&redirectUrl=' +
              redirectUrl +
              '&failureRedirectUrl=' +
              failureRedirectUrl;
            console.log('============= wyre URL2: ', url);

            this.openExternalLink(url);
          })
          .catch(err => {
            this.showError(err);
          });
      })
      .catch(err => {
        this.showError(err);
      });
  }

  private openExternalLink(url: string) {
    this.externalLinkProvider
      .open(url, true, 'Go to wyre', 'Are you sure?', 'ok', 'cancel')
      .then(() => {
        setTimeout(() => {
          this.navCtrl.popToRoot();
        }, 2500);
      });
  }

  private getSimplexQuote(): void {
    this.logger.debug('Simplex getting quote');

    this.sAmountLimits = this.simplexProvider.getFiatCurrencyLimits(
      this.fiatCurrency,
      this.coin
    );
    console.log('---------------------this.samount', this.sAmountLimits);

    if (
      this.amount < this.sAmountLimits.min ||
      this.amount > this.sAmountLimits.max
    ) {
      this.sErrorMsg = `The ${this.fiatCurrency} amount must be between ${
        this.sAmountLimits.min
      } and ${this.sAmountLimits.max}`;
      return;
    } else {
      const data = {
        digital_currency: this.wallet.coin.toUpperCase(),
        fiat_currency: this.fiatCurrency,
        requested_currency: this.fiatCurrency,
        requested_amount: this.amount,
        end_user_id: this.walletId
      };

      this.simplexProvider
        .getQuote(this.wallet, data)
        .then(data => {
          if (data) {
            console.log('========= SIMPLEX getQuote data: ', data);
            const totalAmount = data.fiat_money.total_amount;
            this.sAmountReceiving = data.digital_money.amount;
            this.sFiatMoney = Number(
              totalAmount / this.sAmountReceiving
            ).toFixed(
              this.currencyProvider.getPrecision(this.coin).unitDecimals
            );
            this.logger.debug('Simplex getting quote: SUCCESS');
          }
        })
        .catch(err => {
          this.logger.error('Simplex getting quote FAILED: ' + err);
        });
    }
  }

  private getWyreQuote(): void {
    this.walletProvider
      .getAddress(this.wallet, false)
      .then(address => {
        const data = {
          amount: this.amount.toString(),
          sourceCurrency: this.currency.toUpperCase(),
          destCurrency: this.coin.toUpperCase(),
          dest: 'bitcoin:' + address,
          country: 'US'
        };

        this.wyreProvider
          .walletOrderQuotation(this.wallet, data)
          .then((data: any) => {
            if (data) {
              console.log('--------- WYRE walletOrderQuotation data: ', data);
              if (data && data.exceptionId) {
                this.logger.error(JSON.stringify(data));
                this.showError(data.message);
                return;
              }

              if (data && data.error && !_.isEmpty(data.error)) {
                this.showError(data.error);
                return;
              }

              this.wFiatMoney = data.sourceAmount / data.destAmount; // sourceAmount = Total amount (including fees)

              this.wAmountReceiving = data.destAmount.toFixed(
                this.currencyProvider.getPrecision(this.coin).unitDecimals
              );

              this.logger.debug('Wyre getting quote: SUCCESS');
            } else {
              // show error
              console.log('--------------------- testRequest() err2: ');
            }
          })
          .catch(err => {
            // show error
            console.log('--------------------- testRequest() err: ', err);
          });
      })
      .catch(err => {
        // show error
        console.log('--------------------- testRequest() err2: ', err);
      });
  }

  private setFiatCurrency() {
    if (this.currency === this.coin.toUpperCase()) {
      const config = this.configProvider.get();
      this.fiatCurrency = _.includes(
        this.simplexProvider.supportedFiatAltCurrencies,
        config.wallet.settings.alternativeIsoCode
      )
        ? config.wallet.settings.alternativeIsoCode
        : 'usd';
    } else {
      this.fiatCurrency = this.currency;
    }
  }

  public goToEdit(): void {
    this.navCtrl.pop();
  }

  public showError(err) {
    console.log('======== crypto-offers showError: ', err);
  }
}
