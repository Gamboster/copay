import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import * as _ from 'lodash';
import env from '../../environments';

// providers
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

const URI_DEV = 'https://api.testwyre.com';
const URI_PROD = 'https://api.sendwyre.com';

@Injectable()
export class WyreProvider {
  private env: string;
  public uri: string;
  public supportedFiatAltCurrencies;

  constructor(
    private http: HttpClient,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider
  ) {
    this.env = env.name == 'development' ? 'sandbox' : 'production';
    this.logger.debug('WyreProvider initialized - env: ' + this.env);
    this.uri = env.name == 'development' ? URI_DEV : URI_PROD;
    this.supportedFiatAltCurrencies = ['EUR', 'USD'];
  }

  public getRates() {
    const url = 'https://api.sendwyre.com/v3/rates';
    const headers = {
      'Content-Type': 'application/json'
    };

    // as: DIVISOR, MULTIPLIER, or PRICED
    const params = new HttpParams().set('as', 'PRICED');

    return new Promise((resolve, reject) => {
      this.http.get(url, { headers, params }).subscribe(
        data => {
          return resolve(data);
        },
        err => {
          return reject(err);
        }
      );
    });
  }

  public walletOrderReservation(wallet, data): Promise<any> {
    data.env = this.env;
    return wallet.wyreWalletOrderReservation(data);
  }

  public getWyreUrlParams(wallet): Promise<any> {
    const data = {
      env: this.env
    };
    return wallet.wyreUrlParams(data);
  }

  public getTransfer(transferId: string) {
    const url = this.uri + '/v2/transfer/' + transferId + '/track';
    const headers = {
      'Content-Type': 'application/json'
    };

    console.log('Intentando getTransfer: ', url);
    return new Promise((resolve, reject) => {
      this.http.get(url, { headers }).subscribe(
        data => {
          return resolve(data);
        },
        err => {
          return reject(err);
        }
      );
    });
  }

  public saveWyre(data, opts): Promise<any> {
    const env = this.env;
    data.created_on = Date.now();

    return this.persistenceProvider.getWyre(env).then(oldData => {
      if (_.isString(oldData)) {
        oldData = JSON.parse(oldData);
      }
      if (_.isString(data)) {
        data = JSON.parse(data);
      }
      let inv = oldData ? oldData : {};
      inv[data.transferId] = data;
      if (opts && (opts.error || opts.status)) {
        inv[data.transferId] = _.assign(inv[data.transferId], opts);
      }
      if (opts && opts.remove) {
        delete inv[data.transferId];
      }

      inv = JSON.stringify(inv);

      this.persistenceProvider.setWyre(env, inv);
      return Promise.resolve();
    });
  }

  public getWyre(): Promise<any> {
    const env = this.env;
    return this.persistenceProvider.getWyre(env);
  }
}
