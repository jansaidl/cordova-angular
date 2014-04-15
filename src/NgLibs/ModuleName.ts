/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="Module.ts" />

module NgLibs {

	export class ModuleName extends Module {

		constructor(angularName: string) {
			super(angularName);
			this.running = true;
		}

		createModule() {
			this.module = angular.module(this.getAngularName());
		}

	}
}
