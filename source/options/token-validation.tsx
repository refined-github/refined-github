import {$$} from 'select-dom';
import {$} from 'select-dom/strict.js';

import {assertError} from 'ts-extras';
import type {SyncedForm} from 'webext-options-sync-per-domain';

import {getTokenInfo, tokenUser} from '../github-helpers/github-token.js';
import delay from '../helpers/delay.js';

const rtf = new Intl.RelativeTimeFormat('en', {numeric: 'auto'});

type Status = {
	error?: true;
	text?: string;
	scopes?: string[];
};

function reportStatus({error, text, scopes = ['unknown']}: Status = {}): void {
	const tokenStatus = $('#validation');
	tokenStatus.textContent = text ?? '';
	if (error) {
		tokenStatus.dataset.validation = 'invalid';
	} else {
		delete tokenStatus.dataset.validation;
	}

	for (const scope of $$('[data-scope]')) {
		scope.dataset.validation = scopes.includes(scope.dataset.scope!)
			? 'valid'
			: scopes.includes('unknown')
				? ''
				: 'invalid';
	}
}

function getApiUrl(): string {
	const tokenLink = $('a#personal-token-link');
	return tokenLink.host === 'github.com'
		? 'https://api.github.com/'
		: `${tokenLink.origin}/api/v3/`;
}

function expandTokenSection(): void {
	$('details#token').open = true;
}

async function validateToken(): Promise<void> {
	const tokenField = $('input[name="personalToken"]');
	reportStatus();

	if (!tokenField.validity.valid || tokenField.value.length === 0) {
		// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
		// https://github.com/refined-github/refined-github/issues/6807
		setTimeout(expandTokenSection, 100);
		return;
	}

	reportStatus({text: 'Validating…'});

	try {
		const base = getApiUrl();
		const [tokenInfo, user] = await Promise.all([
			getTokenInfo(base, tokenField.value),
			tokenUser.get(base, tokenField.value),
		]);

		// Build status message with user and expiration
		let statusMessage = `👤 @${user}`;
		if (tokenInfo.expiration) {
			const msUntilExpiration = new Date(tokenInfo.expiration).getTime() - Date.now();
			const daysUntilExpiration = Math.ceil(msUntilExpiration / (1000 * 60 * 60 * 24));
			statusMessage += `, expires ${rtf.format(daysUntilExpiration, 'day')}`;
		} else {
			statusMessage += ', no expiration';
		}

		reportStatus({
			text: statusMessage,
			scopes: tokenInfo.scopes,
		});
	} catch (error) {
		assertError(error);
		reportStatus({error: true, text: error.message});
		expandTokenSection();
		throw error;
	}
}

export default async function initTokenValidation(syncedForm: SyncedForm | undefined): Promise<void> {
	await validateToken();

	// Listen to events
	const field = $('input[name="personalToken"]');
	field.addEventListener('input', validateToken);
	field.addEventListener('focus', () => {
		field.type = 'text';
	});
	field.addEventListener('blur', () => {
		field.type = 'password';
	});

	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async () => {
		// TODO: Fix upstream bug https://github.com/fregante/webext-options-sync-per-domain/issues/10#issuecomment-3077459946
		await delay(100);
		await validateToken();
	});
}
