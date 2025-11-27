/* eslint-disable unicorn/prevent-abbreviations */

import {
	addMessageListener, type RghMessageValue, type RghMessage, type RghMessageEvent,
} from './message-manager.js';
import {toRghMessageValue, untransferable, type Untransferable} from './message-value.js';
import {registerRpcFunction} from './rpc.js';

export type ReactPropMessageTarget = HTMLElement;

export type ReactPropMessageEvent = RghMessageEvent<never>;

export type ReactProps = Record<string, RghMessageValue>;

type ReactPropMessage = ReactPropMessageEvent & {target: ReactPropMessageTarget};

function getReactProps(targetElement: HTMLElement): Record<string, unknown> | undefined {
	const parent = targetElement.parentElement;
	if (!parent) {
		return;
	}

	const parentProps = getReactPropsEntryValue(parent);
	if (!parentProps) {
		return;
	}

	const parentChildren = parentProps.children as React.ReactNode | React.ReactNode[];
	if (!parentChildren) {
		return;
	}

	if (!Array.isArray(parentChildren)) {
		if (isReactElement(parentChildren)) {
			return parentChildren.props;
		}

		return;
	}

	let targetElementIndex = 0;
	for (const childElement of parent.children) {
		if (childElement === targetElement) {
			break;
		}

		targetElementIndex += 1;
	}

	const targetReactNode = parentChildren.filter(Boolean)[targetElementIndex];
	if (isReactElement(targetReactNode)) {
		return targetReactNode.props;
	}

	// "Not all code paths return a value. ts(7030)" error if removed
	// eslint-disable-next-line no-useless-return
	return;
}

function getReactPropsEntryValue(element: HTMLElement): Record<string, unknown> | undefined {
	return Object.entries(element).find(([key]) => key.includes('reactProps'))?.[1];
}

function isReactElement(node: React.ReactNode): node is React.ReactElement {
	return (
		!(
			!node
			|| typeof node !== 'object'
			|| !('props' in node)
		)
	);
}

function assertGetReactPropsMessage(message: RghMessage): asserts message is ReactPropMessage {
	if (!(message.target instanceof HTMLElement)) {
		throw new TypeError('target should be an HTMLElement');
	}
}

function replacer(_key: string | number | undefined, value: unknown): RghMessageValue | Untransferable {
	if (typeof value === 'function') {
		const rpcMessageName = registerRpcFunction({
			function: value,
			replacer,
		});

		return {
			call: rpcMessageName,
			// Save the function code in case we would want to check it
			value: value.toString(),
		};
	}

	return untransferable;
}

addMessageListener('get-react-props', message => {
	assertGetReactPropsMessage(message);
	return toRghMessageValue(getReactProps(message.target), replacer);
});

// For debugging purposes
globalThis._rgh = {...globalThis._rgh, getReactProps};
