import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';

// providers
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { SimplexProvider } from '../simplex/simplex';
import { WyreProvider } from '../wyre/wyre';

@Injectable()
export class BuyCryptoProvider {
  constructor(
    private configProvider: ConfigProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private logger: Logger,
    private translate: TranslateService,
    private simplexProvider: SimplexProvider,
    private wyreProvider: WyreProvider
  ) {
    this.logger.debug('BuyCrypto Provider initialized');
  }

  public register(): void {
    this.homeIntegrationsProvider.register({
      name: 'buycrypto',
      title: this.translate.instant('Buy Crypto'),
      icon: null,
      showIcon: true,
      logo: null,
      logoWidth: '110',
      background:
        'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
      page: 'CryptoSettingsPage',
      show: !!this.configProvider.get().showIntegration['buycrypto'],
      type: 'exchange'
    });
  }

  public isExchangeSupported(
    exchange: string,
    coin: string,
    currency: string
  ): boolean {
    switch (exchange) {
      case 'simplex':
        return (
          _.includes(
            this.simplexProvider.supportedFiatAltCurrencies,
            currency.toUpperCase()
          ) && _.includes(this.simplexProvider.supportedCoins, coin)
        );
      case 'wyre':
        return (
          _.includes(
            this.wyreProvider.supportedFiatAltCurrencies,
            currency.toUpperCase()
          ) && _.includes(this.wyreProvider.supportedCoins, coin.toUpperCase())
        );
      default:
        return false;
    }
  }
}
