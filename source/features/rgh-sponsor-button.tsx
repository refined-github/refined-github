import select from 'select-dom';
import delegate from 'delegate-it';
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

async function suchLove({delegateTarget}: delegate.Event): Promise<void> {
	const heart = select('.octicon-heart', delegateTarget);
	if (!heart || delegateTarget.closest('details[open]')) {
		return;
	}

	const rect = heart.getBoundingClientRect();
	const love = heart.cloneNode(true);
	Object.assign(love.style, {
		position: 'fixed',
		zIndex: '9999999999',
		left: `${rect.x}px`,
		top: `${rect.y}px`
	});

	document.body.append(love);

	await love.animate({
		transform: [
			'translateZ(0)',
			'translateZ(0) scale(80)'
		],
		opacity: [
			1,
			0
		]
	}, {
		duration: 600,
		easing: 'ease-out'
	}).finished;

	love.remove(); // 💔
}

function handleNewIssue(): void {
	select('.btn-primary[href$="/issues/new/choose"], .btn-primary[href$="/issues/new"]')
		?.addEventListener('mouseenter', wiggleWiggleWiggle);
}

function handleSponsorButton(): void {
	delegate(document, '#sponsor-button-repo, #sponsor-profile-button, [aria-label^="Sponsor @"]', 'click', suchLove);
}

void features.add(__filebasename, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList
	],
	init: handleNewIssue
});

void features.add(__filebasename, {
	include: [
		pageDetect.isRepo,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile
	],
	init: handleSponsorButton
});
