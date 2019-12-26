import { Component } from '@angular/core';
import { StatusBar } from '@ionic-native/status-bar';
import { NavController, Platform } from 'ionic-angular';

import * as _ from 'lodash';

// Providers
import { ConfigProvider } from '../../../../providers/config/config';
import { ExternalLinkProvider } from '../../../../providers/external-link/external-link';
import { HomeIntegrationsProvider } from '../../../../providers/home-integrations/home-integrations';
import { Logger } from '../../../../providers/logger/logger';
import { PopupProvider } from '../../../../providers/popup/popup';
import { WyreProvider } from '../../../../providers/wyre/wyre';

@Component({
  selector: 'page-wyre-settings',
  templateUrl: 'wyre-settings.html'
})
export class WyreSettingsPage {
  private serviceName: string = 'wyre';
  private accessToken;

  public showInHome;
  public service;
  public wyreUser;
  public unverifiedAccount: boolean;
  public loading: boolean;
  public headerColor: string;

  constructor(
    private navCtrl: NavController,
    private popupProvider: PopupProvider,
    private platform: Platform,
    private statusBar: StatusBar,
    private logger: Logger,
    private wyreProvider: WyreProvider,
    private configProvider: ConfigProvider,
    private homeIntegrationsProvider: HomeIntegrationsProvider,
    private externalLinkProvider: ExternalLinkProvider
  ) {
    this.service = _.filter(this.homeIntegrationsProvider.get(), {
      name: this.serviceName
    });
    this.showInHome = !!this.service[0].show;
    this.headerColor = '#365bca';
  }

  ionViewWillEnter() {
    if (this.platform.is('cordova')) {
      this.statusBar.styleBlackOpaque();
    }
  }

  ionViewWillLeave() {
    if (this.platform.is('cordova')) {
      this.statusBar.styleDefault();
    }
  }

  ionViewDidLoad() {
    this.loading = true;
    this.wyreProvider.init((err, data) => {
      if (!err && !data) {
        this.loading = false;
        return;
      }
      if (err) {
        this.logger.error(err);
        this.loading = false;
        this.unverifiedAccount = err == 'unverified_account' ? true : false;
        return;
      }

      this.accessToken = data.accessToken;
      this.wyreProvider.getAccount(this.accessToken, (err, account) => {
        this.loading = false;
        if (err) this.logger.error(err);
        this.wyreUser = account.data;
      });
    });
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

  public revokeToken() {
    this.popupProvider
      .ionicConfirm(
      'Wyre',
      'Are you sure you would like to log out of your Wyre account?'
      )
      .then(res => {
        if (res) {
          this.wyreProvider.getStoredToken(accessToken => {
            this.wyreProvider.logout(accessToken);
            this.navCtrl.popToRoot();
          });
        }
      });
  }

  public openAuthenticateWindow() {
    let url = 'https://portal.wyre.io/me/fox/dashboard';
    this.externalLinkProvider.open(url);
  }
}
