import {addMessageListener, type RghMessageValue} from './message-manager.js';

export type Replacer = (key: string | number | undefined, value: unknown) => RghMessageValue;

export type Reviver = (value: RghMessageValue) => unknown;

/** Configuration for registering an RPC function. */
export interface RegisterRpcFunctionArguments {
	/** The function to be called when the RPC message is received. */
	// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
	function: Function;
	/** Converts the function's return value to a transferable format. */
	replacer: Replacer;
	/** Converts the incoming message detail back to the expected input type. */
	reviver?: Reviver;
	/** The event target to listen for messages on. */
	target?: EventTarget;
}

export function registerRpcFunction(
	{function: function_, replacer, reviver, target}: RegisterRpcFunctionArguments,
): string {
	const messageName = `rpc:${crypto.randomUUID()}`;

	addMessageListener(messageName, ({detail}) => {
		const output = function_(reviver ? reviver(detail) : detail);
		return replacer(undefined, output);
	}, target);

	return messageName;
}
