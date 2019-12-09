import { NgModule } from '@angular/core';

import { DecimalPipe } from '@angular/common';

import {
  ActionSheetProvider,
  AddressBookProvider,
  AddressProvider,
  AnalyticsProvider,
  AndroidFingerprintAuth,
  AppIdentityProvider,
  AppProvider,
  BackupProvider,
  BitPayAccountProvider,
  BitPayCardProvider,
  BitPayProvider,
  BwcErrorProvider,
  BwcProvider,
  Clipboard,
  ClipboardProvider,
  CoinbaseProvider,
  ConfigProvider,
  CurrencyProvider,
  DerivationPathHelperProvider,
  Device,
  DomProvider,
  DownloadProvider,
  ElectronProvider,
  EmailNotificationsProvider,
  ExternalLinkProvider,
  FCMNG,
  FeedbackProvider,
  FeeProvider,
  File,
  FilterProvider,
  GiftCardProvider,
  HomeIntegrationsProvider,
  HttpRequestsProvider,
  InAppBrowser,
  IncomingDataProvider,
  InvoiceProvider,
  KeyProvider,
  LanguageLoader,
  LanguageProvider,
  LaunchReview,
  Logger,
  OnGoingProcessProvider,
  PayproProvider,
  PersistenceProvider,
  PlatformProvider,
  PopupProvider,
  PriceProvider,
  ProfileProvider,
  PushNotificationsProvider,
  QRScanner,
  RateProvider,
  ReplaceParametersProvider,
  ScanProvider,
  ScreenOrientation,
  ShapeshiftProvider,
  SimplexProvider,
  SocialSharing,
  SplashScreen,
  StatusBar,
  TimeProvider,
  Toast,
  TouchID,
  TouchIdProvider,
  TxConfirmNotificationProvider,
  TxFormatProvider,
  UserAgent,
  Vibration,
  WalletProvider,
  WalletTabsProvider
} from './index';

@NgModule({
  providers: [
    ActionSheetProvider,
    AddressProvider,
    AddressBookProvider,
    AnalyticsProvider,
    AndroidFingerprintAuth,
    AppProvider,
    AppIdentityProvider,
    BackupProvider,
    BitPayProvider,
    BitPayCardProvider,
    BitPayAccountProvider,
    BwcProvider,
    BwcErrorProvider,
    ConfigProvider,
    CoinbaseProvider,
    Clipboard,
    ClipboardProvider,
    CurrencyProvider,
    DerivationPathHelperProvider,
    Device,
    DomProvider,
    DownloadProvider,
    ExternalLinkProvider,
    FeedbackProvider,
    FCMNG,
    HomeIntegrationsProvider,
    HttpRequestsProvider,
    InAppBrowser,
    FeeProvider,
    GiftCardProvider,
    IncomingDataProvider,
    InvoiceProvider,
    KeyProvider,
    LanguageLoader,
    LanguageProvider,
    LaunchReview,
    Logger,
    ElectronProvider,
    OnGoingProcessProvider,
    PayproProvider,
    PlatformProvider,
    PriceProvider,
    ProfileProvider,
    PopupProvider,
    QRScanner,
    PushNotificationsProvider,
    RateProvider,
    ReplaceParametersProvider,
    ShapeshiftProvider,
    SimplexProvider,
    StatusBar,
    SplashScreen,
    ScanProvider,
    ScreenOrientation,
    SocialSharing,
    Toast,
    TouchID,
    Vibration,
    TimeProvider,
    TouchIdProvider,
    TxConfirmNotificationProvider,
    FilterProvider,
    TxFormatProvider,
    UserAgent,
    WalletProvider,
    EmailNotificationsProvider,
    DecimalPipe,
    PersistenceProvider,
    File,
    WalletTabsProvider
  ]
})
export class ProvidersModule {}
