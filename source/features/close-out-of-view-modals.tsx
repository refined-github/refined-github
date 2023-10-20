import {$$} from 'select-dom';
import onetime from 'onetime';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager.js';

const visible = new Set();
const observer = new IntersectionObserver(entries => {
	let lastModal: Element;
	for (const {intersectionRatio, target: modal} of entries) {
		if (intersectionRatio > 0) {
			visible.add(modal);
		} else {
			visible.delete(modal);
		}

		lastModal = modal;
	}

	if (visible.size === 0) {
		observer.disconnect();
		lastModal!.closest('details')!.open = false;
	}
});

let lastOpen: number;
const safetySwitch = new AbortController();

function menuActivatedHandler(event: DelegateEvent): void {
	const details = event.target as HTMLDetailsElement;

	// Safety check #3742
	if (!details.open && lastOpen > Date.now() - 500) {
		safetySwitch.abort();
		console.warn(`The modal was closed too quickly. Disabling ${features.getFeatureID(import.meta.url)} for this session.`);
		return;
	}

	lastOpen = Date.now();

	const modals = $$([
		':scope > details-menu', // "Watch repo" dropdown
		':scope > details-dialog', // "Watch repo" dropdown
		':scope > div > .dropdown-menu', // "Clone or download" and "Repo nav overflow"
	], details);

	for (const modal of modals) {
		observer.observe(modal);
	}
}

function init(): void {
	delegate('.details-overlay', 'toggle', menuActivatedHandler, {capture: true, signal: safetySwitch.signal});
}

void features.add(import.meta.url, {
	init: onetime(init),
});
