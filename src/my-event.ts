export class MyEvent<T> {

	private readonly _listeners: MyEventHandler<T>[] = [];

	public listen(listener: MyEventHandler<T>) {
		this._listeners.push(listener);
	}

	public fire(param?: T) {
		this._listeners.forEach(listener => listener(param));
	}
}

export type MyEventHandler<T> = (param?: T) => void;
