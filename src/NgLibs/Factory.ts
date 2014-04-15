/// <reference path="../types/dt-angular/angular.d.ts" />

module NgLibs {

	export class Factory {

		public static applyToConstructor(constructor: any, argArray: any) {
			var factoryFunction = constructor.bind.apply(constructor, [ this ].concat(argArray));
			return new factoryFunction();
		}

		public static inject(m: ng.IModule) {
			var x: any = this;
			if (x.angularName) {
				m.factory(x.angularName, x.injection(x.angularInjection || [ ]));
			}
		}

		public static injection(injections: any): any {

			return injections.concat( [ (...rest: any[])
				=>
				Factory.applyToConstructor(this, rest) ]);
		}

	}
}