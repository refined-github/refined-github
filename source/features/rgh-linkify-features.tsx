import React from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';
import {wrap} from '../helpers/dom-utils';

function linkifyFeature(codeElement: HTMLElement): void {
		const id = codeElement.textContent as FeatureID;
	if (features.list.includes(id) && !codeElement.closest('a')) {
		wrap(codeElement, <a href={`/sindresorhus/refined-github/blob/main/source/features/${id}.tsx`}/>);
	}
}

function init(): void {
	for (const possibleMention of select.all('.js-comment-body code')) {
		linkifyFeature(possibleMention);
	}
}

void features.add(__filebasename, {
	include: [
		pageDetect.isConversation
	],
	exclude: [
		() => !location.pathname.startsWith('/sindresorhus/refined-github/')
	],
	init
});
