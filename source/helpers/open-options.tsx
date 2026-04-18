import React from 'dom-chef';
import {messageRuntime} from 'webext-msg';

export default function openOptions(
	event: Event | React.UIEvent,
	hash?: string,
): void {
	event.preventDefault();
	void messageRuntime({openOptionsPage: hash ?? ''});
}

export function OptionsLink(): JSX.Element {
	return <button type="button" onClick={openOptions} />;
}
