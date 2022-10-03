export default function batchedFunction<ValueType>(function_: (value: ValueType[]) => unknown): (value: ValueType) => void {
	let queue: ValueType[] = [];

	return value => {
		queue.push(value);

		if (queue.length === 1) {
			setTimeout(() => {
				function_(queue);
				queue = []; // Must create a new array so that `function_` owns the old array
			}, 100);
		}
	};
}
