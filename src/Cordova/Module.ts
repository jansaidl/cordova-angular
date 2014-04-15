/// <reference path="../NgLibs/Module.ts" />
/// <reference path="Object.ts" />
/// <reference path="Toust.ts" />
/// <reference path="SocialSharing.ts" />
/// <reference path="SQLite.ts" />

module Cordova {
	export class Module extends NgLibs.Module {
		constructor() {
			super('Cordova', Cordova);
		}
	}
}
