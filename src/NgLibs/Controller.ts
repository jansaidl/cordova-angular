/// <reference path="../types/dt-angular/angular.d.ts" />

module NgLibs {

	export interface IScope extends ng.IScope {
		vm: any;
	}

	export interface ICallback {
		(...args: any[]);
	}

	export class Controller<S extends IScope> {

		public vm: any;
		private destuctorCallback: ICallback[] = [];

		public static inject(m: ng.IModule) {
			var x: any = this;
			if (x.angularName) {
				m.controller(x.angularName, x.injection(x.angularInjection || [], x));
			}
		}

		public static injection(injections: string[], x: any): any[] {
			return [ '$scope' ].concat(injections).concat([ x ]);
		}

		constructor(public scope: S) {
			this.scope['vm'] = this;
			this.vm = this;
			this.scope.$on('$destroy', () => { this.destructor()} );
		}

		public addDestructorCallback(callback: ICallback) {
			this.destuctorCallback.push(callback);
		}

		public destructor() {
			this.destuctorCallback.map((callback: ICallback) => { callback(this); })
		}
	}
}
