import 'webext-base-css/webext-base.css';
import './options.css';
import {expectElement as $, $$} from 'select-dom';
import {assertError} from 'ts-extras';
import {SyncedForm} from 'webext-options-sync-per-domain';

import {parseTokenScopes} from '../github-helpers/github-token.js';

type Status = {
	tokenType: 'classic' | 'fine_grained';
	error?: true;
	text?: string;
	scopes?: string[];
};

function reportStatus({tokenType, error, text, scopes}: Status): void {
	const tokenStatus = $('#validation');
	tokenStatus.textContent = text ?? '';
	if (error) {
		tokenStatus.dataset.validation = 'invalid';
	} else {
		delete tokenStatus.dataset.validation;
	}

	// Toggle the ulists by token type (default to classic)
	for (const ulist of $$('[data-token-type]')) {
		ulist.style.display = ulist.dataset.tokenType === tokenType ? '' : 'none';
	}

	for (const scope of $$('[data-scope]')) {
		if (scopes) {
			scope.dataset.validation = scopes.includes(scope.dataset.scope!) ? 'valid' : 'invalid';
		} else {
			scope.dataset.validation = '';
		}
	}
}

function getApiUrl(): string {
	const tokenLink = $('a#personal-token-link');
	return tokenLink.host === 'github.com'
		? 'https://api.github.com'
		: `${tokenLink.origin}/api/v3`;
}

async function getNameFromToken(token: string): Promise<string> {
	const response = await fetch(
		getApiUrl() + '/user',
		{
			headers: {
				Authorization: `Bearer ${token}`,
			},
		},
	);

	const details = await response.json();
	if (!response.ok) {
		throw new Error(details.message);
	}

	return details.login;
}

async function getTokenScopes(personalToken: string): Promise<string[]> {
	const response = await fetch(getApiUrl(), {
		cache: 'no-store',
		headers: {
			'User-Agent': 'Refined GitHub',
			'Accept': 'application/vnd.github.v3+json',
			'Authorization': `token ${personalToken}`,
		},
	});

	if (!response.ok) {
		const details = await response.json();
		throw new Error(details.message);
	}

	return parseTokenScopes(response.headers);
}

function expandTokenSection(): void {
	$('details#token').open = true;
}

async function validateToken(): Promise<void> {
	const tokenField = $('input[name="personalToken"]');
	const tokenType = tokenField.value.startsWith('github_pat_') ? 'fine_grained' : 'classic';
	reportStatus({tokenType});

	if (!tokenField.validity.valid || tokenField.value.length === 0) {
	// The Chrome options iframe auto-sizer causes the "scrollIntoView" function to scroll incorrectly unless you wait a bit
	// https://github.com/refined-github/refined-github/issues/6807
		setTimeout(expandTokenSection, 100);
		return;
	}

	reportStatus({text: 'Validating…', tokenType});

	try {
		const [scopes, user] = await Promise.all([
			getTokenScopes(tokenField.value),
			getNameFromToken(tokenField.value),
		]);
		reportStatus({
			tokenType,
			text: `👤 @${user}`,
			scopes,
		});
	} catch (error) {
		assertError(error);
		reportStatus({tokenType, error: true, text: error.message});
		expandTokenSection();
		throw error;
	}
}

export default async function initTokenValidation(syncedForm: SyncedForm | undefined): Promise<void> {
	await validateToken();

	// Update domain-dependent page content when the domain is changed
	syncedForm?.onChange(async domain => {
		$('a#personal-token-link').host = domain === 'default' ? 'github.com' : domain;

		// Delay to let options load first
		setTimeout(validateToken, 100);
	});
}
