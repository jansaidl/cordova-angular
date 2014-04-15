/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="IFilter.ts" />

module NgLibs {

	export class Filter {

		public static applyToConstructor(constructor, argArray) {
			var factoryFunction = constructor.bind.apply(constructor, [ this ].concat(argArray));
			var x = new factoryFunction();
			return (...rest: any[]) => x.filter.apply(x, rest);
		}

		public static inject(m: ng.IModule) {
			var x: any = this;
			if (x.angularName) {
				m.filter(x.angularName, x.injection(x.angularInjection || []));
			}
		}

		public static injection(injections: any): any {
			return injections.concat([ (...rest: any[]) => Filter.applyToConstructor(this, rest) ]);
		}

	}
}