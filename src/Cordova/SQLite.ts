/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="../NgLibs/Service.ts" />
/// <reference path="Object.ts" />
/// <reference path="SQLiteDb.ts" />
/// <reference path="SQLiteTransaction.ts" />
/// <reference path="SQLiteMock.ts" />


module Cordova {

	export class SQLite extends NgLibs.Service {

		public static angularName:string = 'MobileSQLite';
		public static angularInjection:string[] = [ '$cordova', '$q', '$timeout' ];

		private dbs: NgLibs.Utils.AssociativeArray<SQLiteDb> = {};
		private mock: SQLiteMock = null;

		constructor(private $cordova: Object, public $q: ng.IQService, private $timeout: ng.ITimeoutService) {
			super();
			this.$cordova.addConstructor(this);
			if (this.$cordova.isCordova() && false) {
			} else {
				this.mock = new SQLiteMock(this.$q, this.$timeout);
			}
		}

		public exec(name: string, args: any[] = []) {
			console.log('SQLitePlugin exec: ' + name);
			return this.$cordova.exec('SQLitePlugin', name, args, this.mock)
		}

		public getDb(path: string): ng.IPromise<SQLiteDb> {
			console.info('Get DB: ' + path);
			var deferer = this.$q.defer();
			if (path in this.dbs) {
				this.$timeout(() => {
					deferer.resolve(this.dbs[path]);
				});
			} else {
				var db = new SQLiteDb(this, path);
				this.dbs[db.getPath()] = db;
				deferer.resolve(db);
			}
			return deferer.promise;
		}

		public close(db: SQLiteDb): ng.IPromise<SQLiteDb> {
			var deferer = this.$q.defer<SQLiteDb>();
			if (db.getPath() in this.dbs) {
				this.exec('close', [ { path: db.getPath() } ]).then(() => {
					deferer.resolve(db);
				}, () => {
					console.log('Database ' + db.getPath() + ' close fail');
					deferer.reject();
				});
			} else {
				this.$timeout(() => {
					console.log('Database ' + db.getPath() + ' close fail, database not exists');
					deferer.reject();
				});
			}
			return deferer.promise;
		}

		public open(db: SQLiteDb): ng.IPromise<SQLiteDb> {
			console.log('Open DB: ' + db.getPath());
			var deferer = this.$q.defer<SQLiteDb>();
			if (db.getPath() in this.dbs) {
				console.log('Opening DB: ' + db.getPath());
				this.exec('open', [ { name: db.getPath() }]).then((data: any) => {
					console.log('Database opened' + db.getPath());
					deferer.resolve(db);
				}, (error) => {
					console.log('Database ' + db.getPath() + ' open fail' + error);
					deferer.reject();
				});
			} else {
				console.log('Open fail DB: ' + db.getPath());
				this.$timeout(() => {
					console.log('Database ' + db.getPath() + ' open fail, database not exists');
					deferer.reject();
				});
			}
			return deferer.promise;
		}


	}
}

