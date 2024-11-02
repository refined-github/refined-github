import {messageRuntime} from 'webext-msg';

export default function openOptions(event: Event): void {
	event.preventDefault();
	void messageRuntime({openOptionsPage: true});
}
