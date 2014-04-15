/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="IFilter.ts" />
var NgLibs;
(function (NgLibs) {
    var Module = (function () {
        function Module(angularName, namespace) {
            this.angularName = angularName;
            this.namespace = namespace;
            this.running = false;
            this.modules = [];
        }
        Module.prototype.getAngularName = function () {
            return this.angularName;
        };

        Module.prototype.createModule = function () {
            this.runningException();
            this.running = true;
            this.module = angular.module(this.getAngularName(), this.getDependencyList());
        };

        Module.prototype.run = function () {
            this.modules.map(function (m) {
                try  {
                    m.run();
                } catch (e) {
                    throw e;
                }
            });
            this.createModule();
            if (this.namespace) {
                for (var i in this.namespace) {
                    var obj = this.namespace[i];
                    if (obj.hasOwnProperty('angularName') && obj.hasOwnProperty('inject')) {
                        var x = obj;
                        x.inject(this.module);
                    }
                }
            }
        };

        Module.prototype.addModule = function (m) {
            this.runningException();
            this.modules.push(m);
            return this;
        };

        Module.prototype.runningException = function () {
            if (this.running) {
                throw "Module " + this.getAngularName() + " already running";
            }
            return this;
        };

        Module.prototype.notRunningException = function () {
            if (!this.running) {
                throw "Module " + this.getAngularName() + " not running";
            }
            return this;
        };

        Module.prototype.getModule = function () {
            this.notRunningException();
            return this.module;
        };

        Module.prototype.getDependencyList = function () {
            return this.modules.map(function (m) {
                return m.getAngularName();
            });
        };

        Module.prototype.addController = function (ctrl) {
            this.notRunningException();
            this.module.controller(ctrl.angularName, ctrl.injection());
        };
        return Module;
    })();
    NgLibs.Module = Module;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var NgLibs;
(function (NgLibs) {
    var Service = (function () {
        function Service() {
            var rest = [];
            for (var _i = 0; _i < (arguments.length - 0); _i++) {
                rest[_i] = arguments[_i + 0];
            }
        }
        Service.applyToConstructor = function (constructor, argArray) {
            var factoryFunction = constructor.bind.apply(constructor, [this].concat(argArray));
            var instance = new factoryFunction();
            instance.initInjections(argArray);
            instance.init();
            return instance;
        };

        Service.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.service(x.angularName, x.injection(x.angularInjection || []));
            }
        };

        Service.injection = function (injections) {
            var _this = this;
            return injections.concat([function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    return Service.applyToConstructor(_this, rest);
                }]);
        };

        Service.prototype.initInjections = function (injections) {
            return injections;
        };

        Service.prototype.init = function () {
        };
        return Service;
    })();
    NgLibs.Service = Service;
})(NgLibs || (NgLibs = {}));
/// <reference path="../NgLibs/Service.ts" />
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="../types/dt-cordova/cordova.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Cordova;
(function (Cordova) {
    var Object = (function (_super) {
        __extends(Object, _super);
        function Object($q, $timeout, $window) {
            _super.call(this);
            this.$q = $q;
            this.$timeout = $timeout;
            this.$window = $window;
            this.cordova = null;
            if (this.isCordova()) {
                this.cordova = this.$window['cordova'];
            } else {
                this.cordova = {
                    exec: this.execMock,
                    addConstructor: this.addConstructorMock
                };
            }
        }
        Object.prototype.isCordova = function () {
            return !(!this.$window.hasOwnProperty('cordova') && !this.$window.hasOwnProperty('PhoneGap') && !this.$window.hasOwnProperty('phonegap'));
        };

        Object.prototype.execMock = function (success, error, name, execName, args) {
            console.log('Plugin exec ' + name + '.' + execName + ' call default mock');
            if (angular.isFunction(success)) {
                success();
            }
        };

        Object.prototype.addConstructorMock = function (install) {
            if (angular.isFunction(install)) {
                var plugin = install();
                console.log('Plugin mock installed ', plugin);
            } else {
                console.log('Plugin mock instalation fail');
            }
        };

        Object.prototype.exec = function (name, execName, args, mock) {
            var _this = this;
            if (typeof mock === "undefined") { mock = null; }
            var deferer = this.$q.defer();

            if (this.isCordova()) {
                console.log('Cordova exec: ' + name + '/' + execName);
                this.cordova.exec(function (data) {
                    console.log('Cordova exec done: ' + name + '/' + execName);
                    deferer.resolve(data);
                }, function (data) {
                    console.log('Cordova exec fail: ' + name + '/' + execName);
                    deferer.reject(data);
                }, name, execName, args);
            } else {
                if (mock && angular.isFunction(mock[execName])) {
                    console.info('Plugin exec ' + name + '.' + execName + ' call mock');
                    mock[execName].apply(mock, args).then(function (data) {
                        deferer.resolve(data);
                    }, function (data) {
                        deferer.reject(data);
                    });
                } else {
                    this.$timeout(function () {
                        _this.cordova.exec(function (data) {
                            deferer.resolve(data);
                        }, function (data) {
                            deferer.reject(data);
                        }, name, execName, args);
                    });
                }
            }
            return deferer.promise;
        };

        Object.prototype.addConstructor = function (plugin) {
            this.cordova.addConstructor(function () {
                return plugin;
            });
        };
        Object.angularName = '$cordova';
        Object.angularInjection = ['$q', '$timeout', '$window'];
        return Object;
    })(NgLibs.Service);
    Cordova.Object = Object;
})(Cordova || (Cordova = {}));
/// <reference path="../NgLibs/Service.ts" />
/// <reference path="Object.ts" />
var Cordova;
(function (Cordova) {
    var Toast = (function (_super) {
        __extends(Toast, _super);
        function Toast($cordova) {
            _super.call(this);
            this.$cordova = $cordova;
            this.$cordova.addConstructor(this);
        }
        Toast.prototype.exec = function (name, args) {
            if (typeof args === "undefined") { args = []; }
            return this.$cordova.exec('Toast', name, args);
        };

        Toast.prototype.showShortTop = function (message) {
            this.exec('show', [message, 'short', 'top']);
        };

        Toast.prototype.showShortCenter = function (message) {
            this.exec('show', [message, 'short', 'center']);
        };

        Toast.prototype.showShortBottom = function (message) {
            this.exec('show', [message, 'short', 'bottom']);
        };

        Toast.prototype.showLongTop = function (message) {
            this.exec('show', [message, 'long', 'top']);
        };

        Toast.prototype.showLongCenter = function (message) {
            this.exec('show', [message, 'long', 'center']);
        };

        Toast.prototype.showLongBottom = function (message) {
            this.exec('show', [message, 'long', 'bottom']);
        };
        Toast.angularName = 'MobileToast';
        Toast.angularInjection = ['$cordova'];
        return Toast;
    })(NgLibs.Service);
    Cordova.Toast = Toast;
})(Cordova || (Cordova = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="Object.ts" />
/// <reference path="../NgLibs/Service.ts" />
var Cordova;
(function (Cordova) {
    var SocialSharing = (function (_super) {
        __extends(SocialSharing, _super);
        function SocialSharing($cordova) {
            _super.call(this);
            this.$cordova = $cordova;
            this.$cordova.addConstructor(this);
        }
        SocialSharing.prototype.exec = function (name, args) {
            if (typeof args === "undefined") { args = []; }
            return this.$cordova.exec('SocialSharing', name, args);
        };

        SocialSharing.prototype.available = function () {
            return this.exec('available');
        };

        SocialSharing.prototype.share = function (message, subject, file, url) {
            if (typeof subject === "undefined") { subject = null; }
            if (typeof file === "undefined") { file = null; }
            if (typeof url === "undefined") { url = null; }
            return this.exec("share", [message, subject, file, url]);
        };

        SocialSharing.prototype.shareViaTwitter = function (message, image, url) {
            return this.exec("shareViaTwitter", [message, null, image, url]);
        };

        SocialSharing.prototype.shareViaFacebook = function (message, image, url, successCallback, errorCallback) {
            return this.exec("shareViaFacebook", [message, null, image, url]);
        };

        SocialSharing.prototype.shareViaWhatsApp = function (message, image, url) {
            return this.exec("shareViaWhatsApp", [message, null, image, url]);
        };

        SocialSharing.prototype.shareViaSMS = function (message, phonenumbers) {
            return this.exec("shareViaSMS", [message, phonenumbers.concat(',')]);
        };

        SocialSharing.prototype.canShareVia = function (via, message, subject, image, url) {
            return this.exec("canShareVia", [message, subject, image, url, via]);
        };

        SocialSharing.prototype.shareVia = function (via, message, subject, image, url) {
            this.exec("shareVia", [message, subject, image, url, via]);
        };
        SocialSharing.angularName = 'MobileSocialSharing';
        SocialSharing.angularInjection = ['$cordova'];
        return SocialSharing;
    })(NgLibs.Service);
    Cordova.SocialSharing = SocialSharing;
})(Cordova || (Cordova = {}));
/// <reference path="../NgLibs/Service.ts" />
var Cordova;
(function (Cordova) {
    var SQLiteDb = (function () {
        function SQLiteDb(plugin, path) {
            this.plugin = plugin;
            this.path = path;
            this.isOpen = false;
        }
        SQLiteDb.prototype.getPath = function () {
            return this.path;
        };

        SQLiteDb.prototype.open = function () {
            var _this = this;
            var promise = this.plugin.open(this);
            promise.then(function () {
                _this.isOpen = true;
            });
            return promise;
        };

        SQLiteDb.prototype.close = function () {
            var _this = this;
            var promise = this.plugin.close(this);
            promise.then(function () {
                _this.isOpen = false;
            });
            return promise;
        };

        SQLiteDb.prototype.transaction = function () {
            return new Cordova.SQLiteTransaction(this, this.plugin.$q);
        };
        return SQLiteDb;
    })();
    Cordova.SQLiteDb = SQLiteDb;
})(Cordova || (Cordova = {}));
/// <reference path="../NgLibs/Service.ts" />
var Cordova;
(function (Cordova) {
    var SQLiteTransaction = (function () {
        function SQLiteTransaction(db, $q) {
            this.db = db;
            this.$q = $q;
            this.transactionQueue = {};
        }
        SQLiteTransaction.get_unique_id = function () {
            var id, id2;
            id = new Date().getTime();
            id2 = new Date().getTime();
            while (id === id2) {
                id2 = new Date().getTime();
            }
            return id2 + "000";
        };

        SQLiteTransaction.prototype.executeSql = function (query, params) {
            if (typeof params === "undefined") { params = []; }
            console.log('SQL exec: ' + query);
            console.log('SQL exec params: ' + params);
            var deferred = this.$q.defer();
            var queryId = SQLiteTransaction.get_unique_id();
            var queryObj = {
                qid: queryId,
                query: [query].concat(params),
                sql: query,
                params: params,
                deferred: deferred
            };

            this.transactionQueue[queryId] = queryObj;
            return deferred.promise;
        };

        SQLiteTransaction.prototype.txCompleteCallback = function (result) {
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
                                    item: function (i) {
                                        return saveres[i];
                                    },
                                    length: saveres.length
                                },
                                rowsAffected: queryResult.rowsAffected || null,
                                insertId: queryResult.insertId || null
                            };
                        } else {
                            res = {
                                type: queryResult.type,
                                rows: {
                                    length: 0
                                },
                                rowsAffected: queryResult.rowsAffected || null,
                                insertId: queryResult.insertId || null
                            };
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
        };

        SQLiteTransaction.prototype.complete = function () {
            var _this = this;
            var defered = this.$q.defer();
            console.info('Database query complete');
            var executes = [];
            for (var queryId in this.transactionQueue) {
                var request = this.transactionQueue[queryId];
                var qid = request.qid;
                executes.push({
                    qid: qid,
                    query: [request.sql].concat(request.params),
                    sql: request.sql,
                    params: request.params
                });
                console.log('QUERY ' + request.sql + ' qui: ' + qid);
            }
            this.db.plugin.exec("executeSqlBatch", [{
                    executes: executes,
                    dbargs: {
                        dbname: this.db.getPath()
                    }
                }]).then(function (result) {
                console.info('Database query complete done ' + result);
                _this.txCompleteCallback(result);
                defered.resolve(result);
            }, function (error) {
                defered.resolve(error);
            });
            return defered.promise;
        };
        return SQLiteTransaction;
    })();
    Cordova.SQLiteTransaction = SQLiteTransaction;
})(Cordova || (Cordova = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var Cordova;
(function (Cordova) {
    var SQLiteMock = (function () {
        function SQLiteMock($q, $timeout) {
            this.$q = $q;
            this.$timeout = $timeout;
        }
        SQLiteMock.prototype.open = function (x) {
            var _this = this;
            var defered = this.$q.defer();

            this.$timeout(function () {
                _this.db = window.openDatabase(x['dbName'], '1.0', x['dbName'], 1000000);
                defered.resolve(_this.db);
            });

            return defered.promise;
        };

        SQLiteMock.prototype.executeSqlBatch = function (queryList) {
            var _this = this;
            var deferer = this.$q.defer();

            this.db.transaction(function (tx) {
                var count = 0;
                var results = { results: {} };
                angular.forEach(queryList.executes, function (query, queryId) {
                    count++;
                    tx.executeSql(query.sql, query.params, function (tx, data) {
                        console.info(data);
                        results[queryId] = query;
                        results[queryId]['result'] = data;
                        count--;
                        if (count == 0) {
                            deferer.resolve(results);
                        }
                    }, function () {
                        var rest = [];
                        for (var _i = 0; _i < (arguments.length - 0); _i++) {
                            rest[_i] = arguments[_i + 0];
                        }
                        count--;
                        console.info('SQL QUERY FAIL', rest);
                        if (count == 0) {
                            deferer.resolve(results);
                        }
                    });
                });
                if (count == 0) {
                    _this.$timeout(function () {
                        deferer.resolve(results);
                    });
                }
            });

            return deferer.promise;
        };
        return SQLiteMock;
    })();
    Cordova.SQLiteMock = SQLiteMock;
})(Cordova || (Cordova = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="../NgLibs/Service.ts" />
/// <reference path="Object.ts" />
/// <reference path="SQLiteDb.ts" />
/// <reference path="SQLiteTransaction.ts" />
/// <reference path="SQLiteMock.ts" />
var Cordova;
(function (Cordova) {
    var SQLite = (function (_super) {
        __extends(SQLite, _super);
        function SQLite($cordova, $q, $timeout) {
            _super.call(this);
            this.$cordova = $cordova;
            this.$q = $q;
            this.$timeout = $timeout;
            this.dbs = {};
            this.mock = null;
            this.$cordova.addConstructor(this);
            if (this.$cordova.isCordova() && false) {
            } else {
                this.mock = new Cordova.SQLiteMock(this.$q, this.$timeout);
            }
        }
        SQLite.prototype.exec = function (name, args) {
            if (typeof args === "undefined") { args = []; }
            console.log('SQLitePlugin exec: ' + name);
            return this.$cordova.exec('SQLitePlugin', name, args, this.mock);
        };

        SQLite.prototype.getDb = function (path) {
            var _this = this;
            console.info('Get DB: ' + path);
            var deferer = this.$q.defer();
            if (path in this.dbs) {
                this.$timeout(function () {
                    deferer.resolve(_this.dbs[path]);
                });
            } else {
                var db = new Cordova.SQLiteDb(this, path);
                this.dbs[db.getPath()] = db;
                deferer.resolve(db);
            }
            return deferer.promise;
        };

        SQLite.prototype.close = function (db) {
            var deferer = this.$q.defer();
            if (db.getPath() in this.dbs) {
                this.exec('close', [{ path: db.getPath() }]).then(function () {
                    deferer.resolve(db);
                }, function () {
                    console.log('Database ' + db.getPath() + ' close fail');
                    deferer.reject();
                });
            } else {
                this.$timeout(function () {
                    console.log('Database ' + db.getPath() + ' close fail, database not exists');
                    deferer.reject();
                });
            }
            return deferer.promise;
        };

        SQLite.prototype.open = function (db) {
            console.log('Open DB: ' + db.getPath());
            var deferer = this.$q.defer();
            if (db.getPath() in this.dbs) {
                console.log('Opening DB: ' + db.getPath());
                this.exec('open', [{ name: db.getPath() }]).then(function (data) {
                    console.log('Database opened' + db.getPath());
                    deferer.resolve(db);
                }, function (error) {
                    console.log('Database ' + db.getPath() + ' open fail' + error);
                    deferer.reject();
                });
            } else {
                console.log('Open fail DB: ' + db.getPath());
                this.$timeout(function () {
                    console.log('Database ' + db.getPath() + ' open fail, database not exists');
                    deferer.reject();
                });
            }
            return deferer.promise;
        };
        SQLite.angularName = 'MobileSQLite';
        SQLite.angularInjection = ['$cordova', '$q', '$timeout'];
        return SQLite;
    })(NgLibs.Service);
    Cordova.SQLite = SQLite;
})(Cordova || (Cordova = {}));
/// <reference path="../NgLibs/Module.ts" />
/// <reference path="Object.ts" />
/// <reference path="Toust.ts" />
/// <reference path="SocialSharing.ts" />
/// <reference path="SQLite.ts" />
var Cordova;
(function (Cordova) {
    var Module = (function (_super) {
        __extends(Module, _super);
        function Module() {
            _super.call(this, 'Cordova', Cordova);
        }
        return Module;
    })(NgLibs.Module);
    Cordova.Module = Module;
})(Cordova || (Cordova = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var NgLibs;
(function (NgLibs) {
    var Controller = (function () {
        function Controller(scope) {
            var _this = this;
            this.scope = scope;
            this.destuctorCallback = [];
            this.scope['vm'] = this;
            this.vm = this;
            this.scope.$on('$destroy', function () {
                _this.destructor();
            });
        }
        Controller.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.controller(x.angularName, x.injection(x.angularInjection || [], x));
            }
        };

        Controller.injection = function (injections, x) {
            return ['$scope'].concat(injections).concat([x]);
        };

        Controller.prototype.addDestructorCallback = function (callback) {
            this.destuctorCallback.push(callback);
        };

        Controller.prototype.destructor = function () {
            var _this = this;
            this.destuctorCallback.map(function (callback) {
                callback(_this);
            });
        };
        return Controller;
    })();
    NgLibs.Controller = Controller;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var NgLibs;
(function (NgLibs) {
    var Directive = (function () {
        function Directive() {
            this.definitionFile = {};
            this.definitionFile = {};
        }
        Directive.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.directive(x['angularName'], x.injection(x.angularInjection || []));
            }
        };

        Directive.injection = function (injections) {
            var _this = this;
            return injections.concat([function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    var factoryFunction = _this.bind.apply(_this, [_this].concat(rest));
                    var directive = new factoryFunction();
                    return directive.getDefinitionObject();
                }]);
        };

        Directive.prototype.getDefinitionObject = function () {
            var _this = this;
            var x = this;
            if (typeof x.compile === 'function') {
                this.definitionFile.compile = function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    return x.compile.apply(x, rest);
                };
            }
            if (this['link']) {
                this.definitionFile.link = function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    return _this['link'].apply(_this, rest);
                };
            }
            return this.definitionFile;
        };
        return Directive;
    })();
    NgLibs.Directive = Directive;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var NgLibs;
(function (NgLibs) {
    var Factory = (function () {
        function Factory() {
        }
        Factory.applyToConstructor = function (constructor, argArray) {
            var factoryFunction = constructor.bind.apply(constructor, [this].concat(argArray));
            return new factoryFunction();
        };

        Factory.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.factory(x.angularName, x.injection(x.angularInjection || []));
            }
        };

        Factory.injection = function (injections) {
            var _this = this;
            return injections.concat([function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    return Factory.applyToConstructor(_this, rest);
                }]);
        };
        return Factory;
    })();
    NgLibs.Factory = Factory;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="IFilter.ts" />
var NgLibs;
(function (NgLibs) {
    var Filter = (function () {
        function Filter() {
        }
        Filter.applyToConstructor = function (constructor, argArray) {
            var factoryFunction = constructor.bind.apply(constructor, [this].concat(argArray));
            var x = new factoryFunction();
            return function () {
                var rest = [];
                for (var _i = 0; _i < (arguments.length - 0); _i++) {
                    rest[_i] = arguments[_i + 0];
                }
                return x.filter.apply(x, rest);
            };
        };

        Filter.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.filter(x.angularName, x.injection(x.angularInjection || []));
            }
        };

        Filter.injection = function (injections) {
            var _this = this;
            return injections.concat([function () {
                    var rest = [];
                    for (var _i = 0; _i < (arguments.length - 0); _i++) {
                        rest[_i] = arguments[_i + 0];
                    }
                    return Filter.applyToConstructor(_this, rest);
                }]);
        };
        return Filter;
    })();
    NgLibs.Filter = Filter;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
/// <reference path="Module.ts" />
var NgLibs;
(function (NgLibs) {
    var ModuleName = (function (_super) {
        __extends(ModuleName, _super);
        function ModuleName(angularName) {
            _super.call(this, angularName);
            this.running = true;
        }
        ModuleName.prototype.createModule = function () {
            this.module = angular.module(this.getAngularName());
        };
        return ModuleName;
    })(NgLibs.Module);
    NgLibs.ModuleName = ModuleName;
})(NgLibs || (NgLibs = {}));
var NgLibs;
(function (NgLibs) {
    (function (Utils) {
        var CallbackArray = (function () {
            function CallbackArray() {
                this.callbacks = [];
            }
            CallbackArray.prototype.trigger = function (context, args) {
                this.callbacks.map(function (callback) {
                    if (context) {
                        callback.apply(context, args);
                    }
                });
            };

            CallbackArray.prototype.add = function (callback) {
                this.callbacks.push(callback);
            };
            return CallbackArray;
        })();
        Utils.CallbackArray = CallbackArray;

        var EventCallbacks = (function () {
            function EventCallbacks() {
                this.events = {};
            }
            EventCallbacks.prototype.addCallback = function (name, callback) {
                this.getEventCallbacks(name).add(callback);
            };

            EventCallbacks.prototype.getEventCallbacks = function (name) {
                if (!this.events[name]) {
                    this.events[name] = new CallbackArray();
                }
                return this.events[name];
            };

            EventCallbacks.prototype.triggerEvent = function (name, context, args) {
                this.getEventCallbacks(name).trigger(context, args);
            };
            return EventCallbacks;
        })();
        Utils.EventCallbacks = EventCallbacks;
    })(NgLibs.Utils || (NgLibs.Utils = {}));
    var Utils = NgLibs.Utils;
})(NgLibs || (NgLibs = {}));
/// <reference path="../types/dt-angular/angular.d.ts" />
var NgLibs;
(function (NgLibs) {
    var Value = (function () {
        function Value() {
        }
        Value.inject = function (m) {
            var x = this;
            if (x.angularName) {
                m.factory(x.angularName, x.value);
            }
        };
        return Value;
    })();
    NgLibs.Value = Value;
})(NgLibs || (NgLibs = {}));
