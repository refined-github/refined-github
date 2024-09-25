import {messageBackground} from './messaging.js';

export default function openOptions(event: Event): void {
	event.preventDefault();
	void messageBackground({openOptionsPage: true});
}
