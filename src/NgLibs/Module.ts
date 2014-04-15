/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="IFilter.ts" />

module NgLibs {

	export class Module {

		public module: ng.IModule;

		public running: boolean =false;
		private modules: Module[] = [];

		constructor(public angularName: string, public namespace?: any) {
		}

		public getAngularName(): string {
			return this.angularName;
		}

		createModule() {
			this.runningException();
			this.running = true;
			this.module = angular.module(this.getAngularName(), this.getDependencyList());
		}

		run() {
			this.modules.map((m: Module) => {
				try {
					m.run();
				} catch (e) {
					throw e;
				}
			});
			this.createModule();
			if (this.namespace) {
				for (var i in this.namespace) {
					var obj: Object = this.namespace[i];
					if (obj.hasOwnProperty('angularName') && obj.hasOwnProperty('inject')) {
						var x: any = obj;
						x.inject(this.module);
					}
				}
			}
		}

		addModule(m: Module):Module {
			this.runningException();
			this.modules.push(m);
			return this;
		}

		private runningException():Module {
			if (this.running) {
				throw "Module "+ this.getAngularName()+" already running";
			}
			return this;
		}

		private notRunningException():Module {
			if (!this.running) {
				throw "Module "+ this.getAngularName()+" not running";
			}
			return this;
		}

		getModule(): ng.IModule {
			this.notRunningException();
			return this.module;
		}

		getDependencyList(): string[] {
			return this.modules.map((m: Module) => {
				return m.getAngularName()
			})
		}

		addController(ctrl: any) {
			this.notRunningException();
			this.module.controller(ctrl.angularName, ctrl.injection());
		}

	}
}
