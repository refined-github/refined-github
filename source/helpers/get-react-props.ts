import type {RghMessageValue} from '../messages/main/message-manager.js';
import type {ReactProps as _ReactProps} from '../messages/main/react-props.js';
import {sendMessageAndWaitForResponse} from '../messages/isolated/messages.js';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type ReactProps = Record<string, RghMessageValue | Function>;

export default async function getReactProps(target: HTMLElement): Promise<ReactProps> {
	const props = await sendMessageAndWaitForResponse<_ReactProps>('get-react-props', target);
	return replaceRpcDeclarations(props, target);
}

function replaceRpcDeclarations(props: _ReactProps, target: HTMLElement): ReactProps {
	return convertValue(props, target);
}

function convertValue(value: RghMessageValue, target: HTMLElement): any {
	if (value === null || value === undefined) {
		return value;
	}

	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			return value.map(item => convertValue(item, target));
		}

		return Object.fromEntries(
			Object.entries(value)
				.map(([entryKey, nestedValue]) => {
					if (nestedValue && typeof nestedValue === 'object' && 'call' in nestedValue) {
						return [entryKey, async arguments_ => sendMessageAndWaitForResponse(nestedValue.call as string, target, arguments_)];
					}

					return [entryKey, convertValue(nestedValue, target)];
				}),
		);
	}

	return value;
}
