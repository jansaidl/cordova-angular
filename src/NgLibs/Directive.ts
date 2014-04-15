/// <reference path="../types/dt-angular/angular.d.ts" />


module NgLibs {

	export class Directive {

		public definitionFile: ng.IDirective = {};

		public static inject(m: ng.IModule) {
			var x:any = this;
			if (x.angularName) {
				m.directive(x['angularName'], x.injection(x.angularInjection || []));
			}
		}

		public static injection(injections: any): any {
			return injections.concat( [ (...rest: any[]):ng.IDirective => {
				var factoryFunction = this.bind.apply(this, [ this ].concat(rest));
				var directive:Directive = new factoryFunction();
				return directive.getDefinitionObject();
			}]);
		}

		constructor() {
			this.definitionFile = {};
		}

		public getDefinitionObject():ng.IDirective {
			var x = <ng.IDirective>this;
			if (typeof x.compile === 'function') {
				this.definitionFile.compile = (...rest: any[]) => x.compile.apply(x, rest);
			}
			if (this['link']) {
				this.definitionFile.link = (...rest: any[]) => {
					return this['link'].apply(this, rest);
				}
			}
			return this.definitionFile;
		}

	}
}