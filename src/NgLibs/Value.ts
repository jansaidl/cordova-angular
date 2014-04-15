/// <reference path="../types/dt-angular/angular.d.ts" />

module NgLibs {

	export class Value {

		public static inject(m: ng.IModule) {
			var x: any = this;
			if (x.angularName) {
				m.factory(x.angularName, x.value);
			}
		}

	}
}