/// <reference path="../NgLibs/Service.ts" />
/// <reference path="Object.ts" />


module Cordova {

	export class Toast extends NgLibs.Service {

		public static angularName:string = 'MobileToast';
		public static angularInjection:string[] = [ '$cordova' ];

		constructor(private $cordova: Object) {
			super();
			this.$cordova.addConstructor(this);
		}

		private exec(name: string, args: any[] = []) {
			return this.$cordova.exec('Toast', name, args)
		}

		public showShortTop(message: string) {
			this.exec('show', [ message, 'short', 'top' ]);
		}

		public showShortCenter(message: string) {
			this.exec('show', [ message, 'short', 'center' ]);
		}

		public showShortBottom(message: string) {
			this.exec('show', [ message, 'short', 'bottom' ]);
		}

		public showLongTop(message: string) {
			this.exec('show', [ message, 'long', 'top' ]);
		}

		public showLongCenter(message: string) {
			this.exec('show', [ message, 'long', 'center' ]);
		}

		public showLongBottom(message: string) {
			this.exec('show', [ message, 'long', 'bottom' ]);
		}

	}
}

