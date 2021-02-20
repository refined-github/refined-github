import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '.';

function wiggleWiggleWiggle(): void {
	select('#sponsor-button-repo')?.animate({
		transform: [
			'none',
			'rotate(-2deg) scale(1.05)',
			'rotate(2deg) scale(1.1)',
			'rotate(-2deg) scale(1.1)',
			'rotate(2deg) scale(1.1)',
			'rotate(-2deg) scale(1.1)',
			'rotate(2deg) scale(1.05)',
			'none'
		]
	}, 600);
}

function init(): void {
	select('.btn-primary[href$="/issues/new/choose"], .btn-primary[href$="/issues/new"]')
		?.addEventListener('mouseenter', wiggleWiggleWiggle);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList
	],
	init
});
