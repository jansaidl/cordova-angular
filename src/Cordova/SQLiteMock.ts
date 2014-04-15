/// <reference path="../types/dt-angular/angular.d.ts" />

module Cordova {

	export class SQLiteMock {

		private db: any;

		constructor(public $q: ng.IQService, private $timeout: ng.ITimeoutService) {

		}


		public open(x: any) {
			var defered = this.$q.defer();

			this.$timeout(() => {
				this.db = window.openDatabase(x['dbName'], '1.0', x['dbName'], 1000000);
				defered.resolve(this.db);
			});

			return defered.promise;
		}

		public executeSqlBatch(queryList: IQueryList) {
			var deferer = this.$q.defer();

			this.db.transaction((tx: SQLTransaction) => {
				var count = 0;
				var results = { results: {} };
				angular.forEach(queryList.executes, (query, queryId) => {
					count++;
					tx.executeSql(query.sql, query.params, (tx: SQLTransaction, data: SQLResultSet) => {
						console.info(data);
						results[queryId] = query;
						results[queryId]['result'] = data;
						count--;
						if (count == 0) {
							deferer.resolve(results);
						}
					}, (...rest: any[]) => {
						count--;
						console.info('SQL QUERY FAIL', rest);
						if (count == 0) {
							deferer.resolve(results);
						}
					});
				});
				if (count == 0) {
					this.$timeout(() => { deferer.resolve(results) });
				}
			});

			return deferer.promise;
		}

	}
}

