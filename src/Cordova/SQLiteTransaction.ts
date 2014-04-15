/// <reference path="../NgLibs/Service.ts" />


module Cordova {

	export interface IResult {
		rows: {
				item: (i: number) => any;
				length: number;
		};
		rowsAffected: number;
		insertId: number;
	}

	export interface IQueryList {
		dbargs: any;
		executes: IQuery[]
	}

	export interface IQuery {
		qid: string;
		query: any[];
		sql: string;
		params: any[];
		deferred: ng.IDeferred<any>;
	}

	export class SQLiteTransaction {

		private transactionQueue: NgLibs.Utils.AssociativeArray<IQuery> = {};

		public static get_unique_id() {
			var id, id2;
			id = new Date().getTime();
			id2 = new Date().getTime();
			while (id === id2) {
				id2 = new Date().getTime();
			}
			return id2 + "000";
		}


		constructor(private db: SQLiteDb, private $q: ng.IQService) {
		}

		public executeSql(query: string, params: any[] = []): ng.IPromise<IResult> {
			console.log('SQL exec: ' + query);
			console.log('SQL exec params: ' + params);
			var deferred = this.$q.defer<IResult>();
			var queryId = SQLiteTransaction.get_unique_id();
			var queryObj:IQuery = {
				qid: queryId,
				query: [ query ].concat(params),
				sql: query,
				params: params,
				deferred: deferred
			};

			this.transactionQueue[queryId] = queryObj;
			return deferred.promise;
		}


		public txCompleteCallback(result) {
			console.info('Database query complete txCompleteCallback done ');
			for (var resultIndex in result) {
				var queryId = result[resultIndex].qid;
				var queryResult = result[resultIndex].result;
				console.info('RESOLVE Database query complete txCompleteCallback check ' + queryId + ' index: ' + resultIndex);
				if (queryId in this.transactionQueue) {
					console.info('RESOLVE Database query complete txCompleteCallback hit');
					var res = {};
					if (queryResult.rows && queryResult.rows.item) {
						console.info('HAS ITEM');
						res = queryResult;
					} else {
						console.info('NO ITEM FIX');
						console.info('DATA');
						var saveres = queryResult.rows;
						console.info(JSON.stringify(saveres));
						if ((queryResult.rows) && angular.isArray(queryResult.rows)) {
							res = {
								type: queryResult.type,
								rows: {
									item: function (i:number) {
										return saveres[i];
									},
									length: saveres.length
								},
								rowsAffected: queryResult.rowsAffected || null,
								insertId: queryResult.insertId || null
							}
						} else {
							res = {
								type: queryResult.type,
								rows: {
									length: 0
								},
								rowsAffected: queryResult.rowsAffected || null,
								insertId: queryResult.insertId || null
							}
						}
					}

					this.transactionQueue[queryId].deferred.resolve(res);
					delete this.transactionQueue[queryId];
				}
			}

			for (var queryId in this.transactionQueue) {
				console.info('REJECT Database query complete txCompleteCallback miss ' + queryId);
				this.transactionQueue[queryId].deferred.reject();
			}
		}

		public complete(): ng.IPromise<any> {
			var defered = this.$q.defer();
			console.info('Database query complete');
			var executes = [];
			for (var queryId in this.transactionQueue) {
				var request = this.transactionQueue[queryId];
				var qid = request.qid;
				executes.push({
					qid: qid,
					query: [ request.sql ].concat(request.params),
					sql: request.sql,
					params: request.params
				});
				console.log('QUERY ' + request.sql + ' qui: ' +  qid);
			}
			this.db.plugin.exec("executeSqlBatch", [ {
					executes: executes,
					dbargs: {
						dbname: this.db.getPath()
					}
				}]).then((result) => {
				console.info('Database query complete done ' + result);
				this.txCompleteCallback(result);
				defered.resolve(result);
			}, (error) => {
				defered.resolve(error);
			});
			return defered.promise;
		}

	}
}

