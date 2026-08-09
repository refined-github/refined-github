import * as pageDetect from 'github-url-detection';
import {closestElement} from 'select-dom';
import {mount} from 'svelte';

import features from '../feature-manager.js';
import delay from '../helpers/delay.js';
import observe from '../helpers/selector-observer.js';
import Banner from './prevent-link-loss.svelte';

async function attach(field: HTMLTextAreaElement, {signal}: {signal: AbortSignal}): Promise<void> {
	await delay(100, signal);

	const target = closestElement([
		// Almost everywhere
		'fieldset',

		// Editing PR body
		'.CommentBox',
	], field);
	mount(Banner, {
		target,
		props: {
			field,
		},
	});
}

function init(signal: AbortSignal): void {
	observe([
		'textarea.js-comment-field',
		'[class*="MarkdownInput-module__textArea"] textarea',
	], attach, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.hasRichTextEditor,
	],
	init,
});
