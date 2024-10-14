import {isEnterprise} from 'github-url-detection';

let loggingEnabled = true;

export function disableErrorLogging(): void {
	loggingEnabled = false;
}

const {version} = chrome.runtime.getManifest();

const fineGrainedTokenSuggestion = 'Please use a GitHub App, OAuth App, or a personal access token with fine-grained permissions.';
const preferredMessage = 'Refined GitHub does not support per-organization fine-grained tokens. https://github.com/refined-github/refined-github/wiki/Security';

// reads from path like assets/features/NAME.js
function parseFeatureNameFromStack(stack: string): FeatureID | undefined {
	// The stack may show other features due to cross-feature imports, but we want the top-most caller so we need to reverse it
	const match = stack
		.split('\n')
		.toReversed()
		.join('\n')
		.match(/assets\/features\/(.+)\.js/);
	return match?.[1] as FeatureID | undefined;
}

const loggedStacks = new Set<string>();

export function logError(error: unknown, id?: FeatureID): void {
	if (!(error instanceof Error)) {
		return;
	}

	const {message, stack} = error;

	id ??= parseFeatureNameFromStack(stack!);

	if (id && !loggingEnabled) {
		return;
	}

	// Avoid duplicate errors
	if (loggedStacks.has(stack!)) {
		return;
	}

	loggedStacks.add(stack!);

	if (message.endsWith(fineGrainedTokenSuggestion)) {
		console.log('ℹ️', id, '→', message.replace(fineGrainedTokenSuggestion, preferredMessage));
		return;
	}

	if (message.includes('token')) {
		console.log('ℹ️ Refined GitHub →', message, '→', id);
		return;
	}

	const searchIssueUrl = new URL('https://github.com/refined-github/refined-github/issues');
	searchIssueUrl.searchParams.set('q', `is:issue is:open label:bug ${id}`);

	const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
	newIssueUrl.searchParams.set('template', '1_bug_report.yml');
	newIssueUrl.searchParams.set('title', `\`${id}\`: ${message}`);
	newIssueUrl.searchParams.set('repro', location.href);
	newIssueUrl.searchParams.set('description', [
		'```',
		String(error instanceof Error ? error.stack! : error).trim(),
		'```',
	].join('\n'));

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console
	console.group(`❌ ${id}`); // Safari supports only one parameter
	console.log(`📕 ${version} ${isEnterprise() ? 'GHE →' : '→'}`, error); // One parameter improves Safari formatting
	console.log('🔍 Search issue', searchIssueUrl.href);
	console.log('🚨 Report issue', newIssueUrl.href);
	console.groupEnd();
}

export function catchErrors(): void {
	window.addEventListener('error', error => {
		logError(error);
		error.preventDefault();
	});
	addEventListener('unhandledrejection', event => {
		logError(event.reason);
		event.preventDefault();
	});
}
