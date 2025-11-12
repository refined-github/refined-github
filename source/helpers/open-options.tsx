import React from 'dom-chef';
import {messageRuntime} from 'webext-msg';

export default function openOptions(event: Event | React.UIEvent): void {
	event.preventDefault();
	void messageRuntime({openOptionsPage: true});
}

export function OptionsLink(): JSX.Element {
	return (
		<button type="button" onClick={openOptions} />
	);
}
