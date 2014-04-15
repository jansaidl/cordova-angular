/// <reference path="../types/dt-angular/angular.d.ts" />

module NgLibs {

	export class Service {

		public static applyToConstructor(constructor, argArray) {
			var factoryFunction = constructor.bind.apply(constructor, [ this ].concat(argArray));
			var instance = new factoryFunction();
			instance.initInjections(argArray);
			instance.init();
			return instance;
		}

		public static inject(m: ng.IModule) {
			var x: any = this;
			if (x.angularName) {
				m.service(x.angularName, x.injection(x.angularInjection || []));
			}
		}

		public static injection(injections: any): any {
			return injections.concat([ (...rest: any[]) => Service.applyToConstructor(this, rest) ]);
		}

		constructor(...rest: any[]) {
		}

		public initInjections(injections: any[]): any[] {
			return injections;
		}

		public init() {

		}
	}
}