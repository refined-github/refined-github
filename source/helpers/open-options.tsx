import React from 'dom-chef';
import {messageRuntime} from 'webext-msg';

export default function openOptions(hash?: string): void {
	void messageRuntime({openOptionsPage: hash});
}

export function OptionsLink({hash}: {hash?: string}): JSX.Element {
	return (
		<button type="button" onClick={() => {
			openOptions(hash);
		}} />
	);
}
