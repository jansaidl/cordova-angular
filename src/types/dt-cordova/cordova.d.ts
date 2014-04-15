declare var cordova: co.ICordovaStatic;


declare module co {

	export interface ICallback {
		(...args: any[]):any;
	}

	export interface ICordovaStatic  {
		exec(succcess: ICallback, error: ICallback, name: string, execName: string, args: any[]);
		addConstructor(install: ICallback);
	}


}
