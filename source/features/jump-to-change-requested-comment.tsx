import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$} from 'select-dom';

import features from '../feature-manager.js';
import {wrap} from '../helpers/dom-utils.js';
import observe from '../helpers/selector-observer.js';

function linkify(textLine: HTMLElement): void {
	const url = $('a.dropdown-item[href^="#pullrequestreview-"]', textLine.parentElement!)!;
	// `lastChild` is a textNode
	wrap(textLine.lastChild!, <a href={url.hash}/>);
}

function init(signal: AbortSignal): void {
	observe('.merge-status-item.review-item [title*="requested changes"]', linkify, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPRConversation,
	],
	init,
});

/*
Test URLs

https://github.com/ipaddress-gem/ipaddress/pull/22#partial-pull-merging
*/
