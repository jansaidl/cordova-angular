/// <reference path="../NgLibs/Service.ts" />


module Cordova {

	export class SQLiteDb {

		private isOpen: boolean = false;

		constructor(public plugin: SQLite, private path: string) {
		}

		public getPath() {
			return this.path;
		}

		public open(): ng.IPromise<SQLiteDb> {
			var promise = this.plugin.open(this)
			promise.then(() => {
				this.isOpen = true;
			});
			return promise;
		}

		public close(): ng.IPromise<SQLiteDb> {
			var promise = this.plugin.close(this);
			promise.then(() => {
				this.isOpen = false;
			});
			return promise;
		}

		public transaction(): SQLiteTransaction {
			return new SQLiteTransaction(this, this.plugin.$q);
		}

	}
}

