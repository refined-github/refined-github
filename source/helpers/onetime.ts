const notRun = Symbol('false');
export default function onetime<ArgumentsType extends unknown[], ReturnType>(function_: (...arguments_: ArgumentsType) => ReturnType): (...arguments_: ArgumentsType) => ReturnType {
	let returnValue: ReturnType | typeof notRun = notRun;
	return function (this: unknown, ...arguments_: ArgumentsType): ReturnType {
		if (returnValue !== notRun) {
			return returnValue;
		}

		returnValue = Reflect.apply(function_, this, arguments_);
		return returnValue;
	};
}
