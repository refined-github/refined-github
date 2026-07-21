/**
Ensure that an init function is called only once at a time.
Similarly to useEffect, it calls the init function and stores the returned unmount function. When the returned function is called again, it calls the previous unmount function before calling init again.
*/
export default function singleton<T extends (...arguments_: any[]) => any>(init: T): T {
	let unmount: void | (() => void);

	return ((...arguments_: Parameters<T>) => {
		if (typeof unmount === 'function') {
			unmount();
		}

		unmount = init(...arguments_);
	}) as T;
}
