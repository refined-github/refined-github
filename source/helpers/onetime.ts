export default function onetime<Fun extends (...arguments_: unknown[]) => unknown>(function_: Fun): Fun {
	let ran = false;
	return function (this: unknown, ...arguments_: unknown[]): unknown {
		if (ran) {
			return;
		}

		ran = true;
		return Reflect.apply(function_, this, arguments_);
	} as Fun;
}
