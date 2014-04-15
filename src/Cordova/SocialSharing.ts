/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="Object.ts" />
/// <reference path="../NgLibs/Service.ts" />


module Cordova {

	export class SocialSharing extends NgLibs.Service {

		public static angularName:string = 'MobileSocialSharing';
		public static angularInjection:string[] = [ '$cordova' ];

		constructor(private $cordova: Object) {
			super();
			this.$cordova.addConstructor(this);
		}

		private exec(name: string, args: any[] = []) {
			return this.$cordova.exec('SocialSharing', name, args)
		}

		public available() {
			return this.exec('available');
		}

		public share(message: string, subject: string = null, file: string = null, url: string = null) {
			return this.exec("share", [message, subject, file, url]);
		}

		public shareViaTwitter(message, image, url) {
			return this.exec("shareViaTwitter", [message, null, image, url]);
		}

		public shareViaFacebook(message, image, url, successCallback, errorCallback) {
			return this.exec("shareViaFacebook", [message, null, image, url]);
		}

		public shareViaWhatsApp(message, image, url) {
			return this.exec("shareViaWhatsApp", [message, null, image, url]);
		}

		public shareViaSMS(message, phonenumbers: string[]) {
			return this.exec("shareViaSMS", [message, phonenumbers.concat(',')]);
		}

		public canShareVia(via: string, message: string, subject: string, image: string, url: string) {
			return this.exec("canShareVia", [ message, subject, image, url, via ]);
		}

		public shareVia(via: string, message: string, subject: string, image: string, url: string) {
			this.exec("shareVia", [message, subject, image, url, via]);
		}
	}
}

