
module NgLibs.Utils {

	export interface AssociativeArray<T> {
		[ name: string ]: T
	}

	export interface Callback {
		(...args: any[]): any
	}

	export class CallbackArray<T extends Callback> {

		private callbacks: T[] = [];

		public trigger(context: any, args: any[]) {
			this.callbacks.map((callback: T) => {
				if (context) {
					callback.apply(context, args);
				}
			});
		}

		public add(callback: T) {
			this.callbacks.push(callback);
		}

	}

	export class EventCallbacks {

		private events: Utils.AssociativeArray<CallbackArray<Callback>> = {};

		public addCallback(name: string, callback: Callback) {
			this.getEventCallbacks(name).add(callback);
		}

		public getEventCallbacks(name: string) {
			if (!this.events[name]) {
				this.events[name] = new CallbackArray<Callback>();
			}
			return this.events[name];
		}

		public triggerEvent(name: string, context: any, args: any[]) {
			this.getEventCallbacks(name).trigger(context, args)
		}

	}

}