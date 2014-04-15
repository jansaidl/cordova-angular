/// <reference path="../NgLibs/Service.ts" />
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="../types/dt-cordova/cordova.d.ts" />


module Cordova {

	export interface ICallback {
		(...args: any[]):any;
	}

	export class Object extends NgLibs.Service {

		public static angularName:string = '$cordova';
		public static angularInjection:string[] = [ '$q', '$timeout', '$window' ];

		private cordova: co.ICordovaStatic = null;

		constructor(public $q: ng.IQService, public $timeout: ng.ITimeoutService, public $window: ng.IWindowService) {
			super();
			if (this.isCordova()) {
				this.cordova = this.$window['cordova'];
			} else {
				this.cordova = {
					exec: this.execMock,
					addConstructor: this.addConstructorMock
				};
			}
		}

		public isCordova() {
			return !(!this.$window.hasOwnProperty('cordova') && !this.$window.hasOwnProperty('PhoneGap') && !this.$window.hasOwnProperty('phonegap'));
		}

		public execMock(success: ICallback, error: ICallback, name: string, execName: string, args: any[]) {
			console.log('Plugin exec ' + name + '.' +execName +' call default mock');
			if (angular.isFunction(success)) {
				success();
			}
		}

		public addConstructorMock(install: ICallback) {
			if (angular.isFunction(install)) {
				var plugin = install();
				console.log('Plugin mock installed ', plugin);
			} else {
				console.log('Plugin mock instalation fail');
			}
		}

		public exec(name, execName, args: any[], mock: any = null): ng.IPromise<any> {
			var deferer = this.$q.defer();

			if (this.isCordova()) {
				console.log('Cordova exec: ' + name + '/' + execName);
				this.cordova.exec((data) => {
					console.log('Cordova exec done: ' + name + '/' + execName);
					deferer.resolve(data);
				}, (data) => {
					console.log('Cordova exec fail: ' + name + '/' + execName);
					deferer.reject(data);
				}, name, execName, args);
			} else {
				if (mock && angular.isFunction(mock[execName])) {
					console.info('Plugin exec ' + name +'.'+ execName +' call mock');
					mock[execName].apply(mock, args).then((data) => {
						deferer.resolve(data);
					}, (data) => {
						deferer.reject(data);
					});
				} else {
					this.$timeout(() => {
						this.cordova.exec((data) => {
							deferer.resolve(data);
						}, (data) => {
							deferer.reject(data);
						}, name, execName, args);
					});
				}
			}
			return deferer.promise;
		}

		public addConstructor(plugin: any) {
			this.cordova.addConstructor(function() { return plugin; });

		}
	}
}

