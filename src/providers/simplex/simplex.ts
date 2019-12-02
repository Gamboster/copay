import { Injectable } from '@angular/core';
import * as _ from 'lodash';

// providers
import { ConfigProvider } from '../config/config';
import { HomeIntegrationsProvider } from '../home-integrations/home-integrations';
import { Logger } from '../logger/logger';
import { PersistenceProvider } from '../persistence/persistence';

@Injectable()
export class SimplexProvider {
  private possibleEnvironments: string[];
  private env: string;

  constructor(
    private configProvider: ConfigProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private logger: Logger,
    private persistenceProvider: PersistenceProvider
  ) {
    this.logger.debug('SimplexProvider Provider initialized');
    this.possibleEnvironments = ['sandbox', 'production'];
    this.env = this.possibleEnvironments[0];
  }

  public getQuote(wallet, data): Promise<any> {
    return new Promise((resolve, reject) => {
      data.env = this.env;
      wallet
        .simplexGetQuote(data)
        .then(res => {
          return resolve(res.body);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public paymentRequest(wallet, data): Promise<any> {
    return new Promise((resolve, reject) => {
      data.env = this.env;
      wallet
        .simplexPaymentRequest(data)
        .then(res => {
          return resolve(res.body);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public getEvents(wallet): Promise<any> {
    return new Promise((resolve, reject) => {
      let data: any = {};
      data.env = this.env;
      wallet
        .simplexGetEvents(data)
        .then(res => {
          return resolve(res.body);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public register(): void {
    this.homeIntegrationsProvider.register({
      name: 'simplex',
      title: 'Simplex',
      icon: 'assets/img/simplex/icon-simplex.png',
      logo: 'assets/img/simplex/logo-simplex-light.png',
      background:
        'linear-gradient(to bottom,rgba(60, 63, 69, 1) 0,rgba(45, 47, 51, 1) 100%)',
      page: 'SimplexPage',
      show: !!this.configProvider.get().showIntegration['simplex']
    });
  }

  public saveSimplex(data, opts): Promise<any> {
    return new Promise((resolve, reject) => {
      const env = this.env;
      this.persistenceProvider
        .getSimplex(env)
        .then(oldData => {
          if (_.isString(oldData)) {
            oldData = JSON.parse(oldData);
          }
          if (_.isString(data)) {
            data = JSON.parse(data);
          }
          let inv = oldData ? oldData : {};
          inv[data.payment_id] = data;
          if (opts && (opts.error || opts.status)) {
            inv[data.payment_id] = _.assign(inv[data.payment_id], opts);
          }
          if (opts && opts.remove) {
            delete inv[data.payment_id];
          }

          inv = JSON.stringify(inv);

          this.persistenceProvider.setSimplex(env, inv);
          return resolve();
        })
        .catch(err => {
          return reject(err);
        });
    });
  }

  public getSimplex(): Promise<any> {
    return new Promise((resolve, reject) => {
      const env = this.env;
      this.persistenceProvider
        .getSimplex(env)
        .then(simplexData => {
          return resolve(simplexData);
        })
        .catch(err => {
          return reject(err);
        });
    });
  }
}
