/** @jsx h */
import {h} from 'preact';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import render from '../helpers/render';

import {wrap} from '../helpers/dom-utils';
import features from '.';
import {isNotRefinedGitHubRepo} from '../github-helpers';

// eslint-disable-next-line import/prefer-default-export
export function linkifyFeature(codeElement: HTMLElement): void {
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
		pageDetect.hasComments
	],
	exclude: [
		isNotRefinedGitHubRepo
	],
	init
});
