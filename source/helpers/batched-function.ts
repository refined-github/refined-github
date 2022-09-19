export default function batchedFunction<ValueType>(function_: (value: ValueType[]) => unknown): (value: ValueType) => void {
	const queue: ValueType[] = [];

	return value => {
		queue.push(value);

		if (queue.length === 1) {
			setTimeout(() => {
				function_(queue);
				queue.length = 0;
			});
		}
	};
}
