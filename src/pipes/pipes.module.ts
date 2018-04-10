import { NgModule } from '@angular/core';
import { FiatToUnitPipe } from './fiatToUnit';
import { KeysPipe } from './keys';
import { OrderByPipe } from './order-by';
import { SatToFiatPipe } from './satToFiat';
import { SatToUnitPipe } from './satToUnit';

@NgModule({
	declarations: [
		FiatToUnitPipe,
		KeysPipe,
		OrderByPipe,
		SatToFiatPipe,
		SatToUnitPipe
	],
	imports: [],
	exports: [
		FiatToUnitPipe,
		KeysPipe,
		OrderByPipe,
		SatToFiatPipe,
		SatToUnitPipe
	]
})
export class PipesModule { }
