import {$} from 'select-dom/strict.js';

import type {SyncedForm} from 'webext-options-sync-per-domain';

import delay from '../helpers/delay.js';

export default async function initTokenValidation(syncedForm: SyncedForm | undefined): Promise<void> {
	const tokenComponent = $('rgh-token') as HTMLElement & {
		validateToken?: () => Promise<void>;
	};

	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async () => {
		// TODO: Fix upstream bug https://github.com/fregante/webext-options-sync-per-domain/issues/10#issuecomment-3077459946
		await delay(100);
		// Trigger validation by dispatching an input event on the token field
		const tokenField = tokenComponent.querySelector('input[name="personalToken"]') as HTMLInputElement;
		if (tokenField) {
			tokenField.dispatchEvent(new Event('input', {bubbles: true}));
		}
	});
}
