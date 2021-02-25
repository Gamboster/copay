import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TestUtils } from '../../../test';

import { Coin } from '../../../providers/currency/currency';
import { RateProvider } from '../../../providers/rate/rate';
import { AmountPage } from './amount';

describe('AmountPage', () => {
  // TODO: Improve Amount page unit tests
  let fixture: ComponentFixture<AmountPage>;
  let instance;
  let testBed: typeof TestBed;
  let rateProvider: RateProvider;
  let toFiatSpy;

  const wallet = {
    coin: 'bch',
    cachedStatus: {
      totalBalanceStr: '1.000000',
      totalBalanceSat: 100000000,
      availableBalanceStr: '1.000000',
      availableBalanceSat: 100000000
    },
    credentials: {}
  };

  beforeEach(async(() => {
    TestUtils.configurePageTestingModule([AmountPage]).then(testEnv => {
      fixture = testEnv.fixture;
      instance = testEnv.instance;
      testBed = testEnv.testBed;
      fixture.detectChanges();
      rateProvider = testBed.get(RateProvider);
    });
  }));
  afterEach(() => {
    fixture.destroy();
  });

  describe('sendMax', () => {
    beforeEach(() => {
      spyOn(rateProvider, 'getRate').and.returnValue(1000000);
      toFiatSpy = spyOn(rateProvider, 'toFiat').and.returnValue(1000000);
    });
    it('should set the send display value expression to the available balance', () => {
      instance.wallet = wallet;
      instance.ionViewDidLoad();
      instance.sendMax();
      expect(instance.expression).toBe(
        (instance.wallet.cachedStatus.availableBalanceSat / 1e8).toString()
      );
    });

    it('should fetch the bch rate if in bch wallet', () => {
      instance.wallet = wallet;
      instance.ionViewDidLoad();
      instance.fiatCode = 'USD';
      instance.unitIndex = 1;
      instance.unitToSatoshi = 1e8;
      instance.sendMax();
      expect(toFiatSpy).toHaveBeenCalledWith(100000000, 'USD', Coin.BCH);
      expect(instance.expression).toBe('1000000.00');
    });

    it('should skip rate calculations and go directly to confirm if not within wallet', () => {
      const finishSpy = spyOn(instance, 'finish');
      instance.sendMax();
      expect(finishSpy).toHaveBeenCalled();
    });
  });

  describe('changeUnit', () => {
    it('should set default values before call changeUnit for the first time', () => {
      instance.wallet = wallet;
      spyOn(rateProvider, 'getRate').and.returnValue(0);
      spyOn(rateProvider, 'toFiat').and.returnValue(0);
      instance.ionViewDidLoad();
      instance.fiatCode = 'USD';

      expect(instance.availableUnits.length).toBe(2);
      expect(instance.availableUnits[0].id).toBe('bch');
      expect(instance.availableUnits[1].id).toBe('USD');
      expect(instance.unit).toBe('BCH');
      expect(instance.expression).toBe('');
      expect(instance.alternativeAmount).toBe('0');
      expect(instance.globalResult).toBe('');
    });

    it('should change selected unit if it is changed without enter any amount value', () => {
      instance.wallet = wallet;
      spyOn(rateProvider, 'getRate').and.returnValue(0);
      spyOn(rateProvider, 'toFiat').and.returnValue(0);
      instance.ionViewDidLoad();
      instance.fiatCode = 'USD';
      instance.changeUnit();

      expect(instance.availableUnits.length).toBe(2);
      expect(instance.availableUnits[0].id).toBe('bch');
      expect(instance.availableUnits[1].id).toBe('USD');
      expect(instance.unit).toBe('USD');
      expect(instance.expression).toBe('');
      expect(instance.alternativeAmount).toBeNull();
      expect(instance.globalResult).toBe('');
    });

    it('should change selected unit if it is changed after enter a simple value', () => {
      instance.wallet = wallet;
      instance.expression = '100';
      spyOn(rateProvider, 'getRate').and.returnValue(1234567.89);
      spyOn(rateProvider, 'toFiat').and.returnValue(345345.34);
      instance.ionViewDidLoad();
      instance.fiatCode = 'USD';
      instance.changeUnit();

      expect(instance.availableUnits.length).toBe(2);
      expect(instance.availableUnits[0].id).toBe('bch');
      expect(instance.availableUnits[1].id).toBe('USD');
      expect(instance.unit).toBe('USD');
      expect(instance.expression).toBe('345345.34');
      expect(instance.alternativeAmount).toBe('100');
      expect(instance.globalResult).toBe('');
    });

    it('should change selected unit if it is changed after enter an expression', () => {
      instance.wallet = wallet;
      instance.expression = '100+50*2';
      spyOn(rateProvider, 'getRate').and.returnValue(1234567.89);
      spyOn(rateProvider, 'toFiat').and.returnValue(345345.34);
      instance.ionViewDidLoad();
      instance.fiatCode = 'USD';
      instance.changeUnit();

      expect(instance.availableUnits.length).toBe(2);
      expect(instance.availableUnits[0].id).toBe('bch');
      expect(instance.availableUnits[1].id).toBe('USD');
      expect(instance.unit).toBe('USD');
      expect(instance.expression).toBe('345345.34');
      expect(instance.alternativeAmount).toBe('200');
      expect(instance.globalResult).toBe('');
    });
  });
});
