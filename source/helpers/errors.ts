import {isEnterprise} from 'github-url-detection';
import memoize from 'memoize';
import {isSafari} from 'webext-detect';

const warnOnce = memoize(console.warn, {cacheKey: JSON.stringify});

let isLoggingEnabled = true;

export function disableErrorLogging(): void {
	isLoggingEnabled = false;
}

const {version} = chrome.runtime.getManifest();

const fineGrainedTokenSuggestion =
	'Please use a GitHub App, OAuth App, or a personal access token with fine-grained permissions.';
const preferredMessage =
	'Refined GitHub does not support per-organization fine-grained tokens. https://github.com/refined-github/refined-github/wiki/Security';

// Reads from path like assets/features/NAME.js
export function parseFeatureNameFromStack(stack: string = new Error('stack').stack!): FeatureId | undefined {
	// The stack may show other features due to cross-feature imports, but we want the top-most caller so we need to reverse it
	const match = stack
		.split('\n')
		.toReversed()
		.join('\n')
		// eslint-disable-next-line @typescript-eslint/prefer-regexp-exec -- Linear code is best
		.match(/assets\/features\/(?<id>.+)\.js/);
	return match?.groups?.id as FeatureId | undefined;
}

/* Log errors only once */
const loggedStacks = new Set<string>();

// `featureId` is preferred over the one parsed from the stack, which Safari masks
export function logError(error: Error, featureId?: FeatureId): void {
	if (!isLoggingEnabled) {
		return;
	}

	const {message, stack} = error;

	if (message === 'Extension context invalidated.') {
		warnOnce('ℹ️ Refined GitHub has been disabled or updated. Reload the page');
		return;
	}

	// Avoid duplicate errors
	if (loggedStacks.has(stack!)) {
		return;
	}

	loggedStacks.add(stack!);

	const id = featureId ?? parseFeatureNameFromStack(stack);
	if (message.endsWith(fineGrainedTokenSuggestion)) {
		console.log('ℹ️', id, '→', message.replace(fineGrainedTokenSuggestion, preferredMessage));
		return;
	}

	if (message.includes('token')) {
		console.log('ℹ️ Refined GitHub →', message, '→', id);
		return;
	}

	const newIssueUrl = new URL('https://github.com/refined-github/refined-github/issues/new');
	newIssueUrl.searchParams.set('template', '1_bug_report.yml');
	newIssueUrl.searchParams.set('title', id ? `\`${id}\` - ${message}` : message);
	newIssueUrl.searchParams.set('repro', location.href);
	newIssueUrl.searchParams.set(
		'description',
		[
			'```',
			stack!.trim(),
			'```',
		].join('\n'),
	);

	// Don't change this to `throw Error` because Firefox doesn't show extensions' errors in the console
	const scope = id ?? (isSafari() ? undefined : 'global'); // Safari masks the stack, so the scope is often unknown
	console.group(scope ? `❌ Refined GitHub: ${scope}` : '❌ Refined GitHub'); // Safari supports only one parameter
	console.log(`📕 ${version} ${isEnterprise() ? 'GHE →' : '→'}`, error); // One parameter improves Safari formatting
	console.log('🚨 Report issue', newIssueUrl.href);
	console.groupEnd();
}

// Firefox lets extensions catch the host page's errors, ignore them
function isExtensionError(error?: Error): error is Error {
	const stack = error?.stack;
	return Boolean(stack && (stack.includes('-extension://') || stack.includes('webkit-masked-url://')));
}

export function catchErrors(): void {
	globalThis.addEventListener('error', event => {
		const {error} = event; // Access only once
		// Don't use `assertError` or it'll loop
		if (!isExtensionError(error)) {
			return;
		}

		logError(error);
		event.preventDefault();
	});

	globalThis.addEventListener('unhandledrejection', event => {
		const error = event.reason; // Access only once
		// Don't use `assertError` or it'll loop
		if (!isExtensionError(error)) {
			return;
		}

		logError(error);
		event.preventDefault();
	});
}
