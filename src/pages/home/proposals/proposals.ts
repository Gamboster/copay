import { Component, NgZone } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import {
  Events,
  ModalController,
  NavController,
  Platform
} from 'ionic-angular';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

// providers
import { AddressBookProvider } from '../../../providers/address-book/address-book';
import { Logger } from '../../../providers/logger/logger';
import { PlatformProvider } from '../../../providers/platform/platform';
import { ProfileProvider } from '../../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../../providers/replace-parameters/replace-parameters';
import { WalletProvider } from '../../../providers/wallet/wallet';

// pages
import { FinishModalPage } from '../../finish/finish';

@Component({
  selector: 'page-proposals',
  templateUrl: 'proposals.html'
})
export class ProposalsPage {
  public addressbook;
  public allTxps: any[];
  public txpsToSign: any[];
  public walletIdSelectedToSign: string;
  public isCordova: boolean;
  public buttonText: string;
  public hideSlideButton: boolean;

  private zone;
  private onResumeSubscription: Subscription;
  private onPauseSubscription: Subscription;
  private isElectron: boolean;
  private updatingWalletId: object;

  constructor(
    private plt: Platform,
    private addressBookProvider: AddressBookProvider,
    private logger: Logger,
    private profileProvider: ProfileProvider,
    private platformProvider: PlatformProvider,
    private translate: TranslateService,
    private events: Events,
    private replaceParametersProvider: ReplaceParametersProvider,
    private walletProvider: WalletProvider,
    private modalCtrl: ModalController,
    private navCtrl: NavController
  ) {
    this.zone = new NgZone({ enableLongStackTrace: false });
    this.isElectron = this.platformProvider.isElectron;
    this.updatingWalletId = {};
    this.isCordova = this.platformProvider.isCordova;
    this.buttonText = this.translate.instant('Sign multiple proposals');

    this.txpsToSign = [];
  }

  ionViewWillEnter() {
    this.updateAddressBook();
    this.updatePendingProposals();
  }

  ionViewDidLoad() {
    this.subscribeBwsEvents();
    this.subscribeLocalTxAction();

    this.onResumeSubscription = this.plt.resume.subscribe(() => {
      this.subscribeBwsEvents();
      this.subscribeLocalTxAction();
    });

    this.onPauseSubscription = this.plt.pause.subscribe(() => {
      this.events.unsubscribe('bwsEvent');
      this.events.unsubscribe('Local/TxAction');
    });

    // Update Wallet on Focus
    if (this.isElectron) {
      this.updateDesktopOnFocus();
    }
  }

  ngOnDestroy() {
    this.events.unsubscribe('bwsEvent');
    this.events.unsubscribe('Local/TxAction');
    this.onResumeSubscription.unsubscribe();
    this.onPauseSubscription.unsubscribe();
  }

  private subscribeBwsEvents(): void {
    this.events.subscribe('bwsEvent', (walletId: string) => {
      this.updateWallet({ walletId });
    });
  }

  private subscribeLocalTxAction(): void {
    this.events.subscribe('Local/TxAction', opts => {
      this.updateWallet(opts);
    });
  }

  private updateDesktopOnFocus() {
    const { remote } = (window as any).require('electron');
    const win = remote.getCurrentWindow();
    win.on('focus', () => {
      this.updatePendingProposals();
    });
  }

  private updateAddressBook(): void {
    this.addressBookProvider
      .list()
      .then(ab => {
        this.addressbook = ab || {};
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private updateWallet(opts): void {
    if (this.updatingWalletId[opts.walletId]) return;
    this.startUpdatingWalletId(opts.walletId);
    const wallet = this.profileProvider.getWallet(opts.walletId);
    this.walletProvider
      .getStatus(wallet, opts)
      .then(status => {
        wallet.status = status;
        wallet.error = null;
        this.profileProvider.setLastKnownBalance(
          wallet.id,
          wallet.status.availableBalanceStr
        );

        // Update txps
        this.updatePendingProposals();
        this.stopUpdatingWalletId(opts.walletId);
      })
      .catch(err => {
        this.logger.error(err);
        this.stopUpdatingWalletId(opts.walletId);
      });
  }

  private startUpdatingWalletId(walletId: string) {
    this.updatingWalletId[walletId] = true;
  }

  private stopUpdatingWalletId(walletId: string) {
    setTimeout(() => {
      this.updatingWalletId[walletId] = false;
    }, 10000);
  }

  private updatePendingProposals(): void {
    this.profileProvider
      .getTxps({ limit: 50 })
      .then(txpsData => {
        this.zone.run(() => {
          // Check if txp were checked before
          txpsData.txps.forEach(txp => {
            txp.checked = _.indexOf(this.txpsToSign, txp) >= 0 ? true : false;
          });

          this.allTxps = this.groupByWallets(txpsData.txps);

          if (this.allTxps && !this.allTxps[0]) {
            this.navCtrl.pop();
          }
        });
      })
      .catch(err => {
        this.logger.error(err);
      });
  }

  private groupByWallets(txps): any[] {
    const walletIdGetter = txp => txp.walletId;
    const map = new Map();
    const txpsByWallet: any[] = [];

    txps.forEach(txp => {
      const walletId = walletIdGetter(txp);
      const collection = map.get(walletId);

      if (!collection) {
        map.set(walletId, [txp]);
      } else {
        collection.push(txp);
      }
    });
    Array.from(map).forEach(txpsPerWallet => {
      const txpToBeSigned = this.getTxpToBeSigned(txpsPerWallet[1]);
      txpsByWallet.push({
        walletId: txpsPerWallet[0],
        txps: txpsPerWallet[1],
        multipleSignAvailable: txpToBeSigned > 1
      });
    });
    return txpsByWallet;
  }

  private getTxpToBeSigned(txpsPerWallet): number {
    let i = 0;
    txpsPerWallet.forEach(txp => {
      if (txp.status === 'pending') i = i + 1;
    });
    return i;
  }

  public signMultipleProposals(txp): void {
    this.txpsToSign = [];
    this.walletIdSelectedToSign =
      this.walletIdSelectedToSign == txp.walletId ? null : txp.walletId;
  }

  public sign(): void {
    const wallet = this.txpsToSign[0].wallet
      ? this.txpsToSign[0].wallet
      : this.profileProvider.getWallet(this.txpsToSign[0].walletId);
    this.walletProvider
      .publishAndSignMultipleTxps(wallet, this.txpsToSign)
      .then(data => {
        // this.onGoingProcessProvider.clear();
        this.resetMultiSignValues();
        this.openFinishModal(data);
      })
      .catch(err => {
        // this.onGoingProcessProvider.clear();
        this.resetMultiSignValues();
        this.openFailedModal(err);
        this.updatePendingProposals();
        // this.showErrorInfoSheet(err, 'Could not send payment');
      });
  }

  public txpSelectionChange(txp): void {
    if (_.indexOf(this.txpsToSign, txp) >= 0) {
      _.remove(this.txpsToSign, txpToSign => {
        return txpToSign.id == txp.id;
      });
    } else {
      this.txpsToSign.push(txp);
    }
    if (this.isCordova)
      this.hideSlideButton = this.txpsToSign[0] ? false : true;
  }

  private resetMultiSignValues(): void {
    this.txpsToSign = [];
    this.walletIdSelectedToSign = null;
  }

  private openFinishModal(data: any[]): void {
    const txpsAmount = data.length;
    const finishText: string = this.replaceParametersProvider.replace(
      this.translate.instant('{{txpsAmount}} proposals signed'),
      { txpsAmount }
    );
    let modal = this.modalCtrl.create(
      FinishModalPage,
      { finishText },
      { showBackdrop: true, enableBackdropDismiss: false }
    );
    modal.present();
  }

  private openFailedModal(err: string): void {
    const finishText: string = this.translate.instant(
      'Some of your proposals have failed'
    );
    let modal = this.modalCtrl.create(
      FinishModalPage,
      {
        finishText,
        finishComment: err,
        cssClass: 'danger'
      },
      { showBackdrop: true, enableBackdropDismiss: false }
    );
    modal.present();
  }
}
