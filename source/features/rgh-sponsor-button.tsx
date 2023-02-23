/*

                                                       ..       :
                    .                  .               .   .  .
      .           .                .               .. .  .  *
             *          .                    ..        .
                           .             .     . :  .   .    .  .
            .                         .   .  .  .   .
                                         . .  *:. . .
.                                 .  .   . .. .         .
                         .     . .  . ...    .    .
       .              .  .  . .    . .  . .
                        .    .     . ...   ..   .       .               .
                 .  .    . *.   . .
    .                   :.  .           .
                 .   .    .    .
             .  .  .    ./|\
            .  .. :.    . |             .               .
     .   ... .            |
 .    :.  . .   *.        |     .               .
   .  *.             You are here.
 . .    .               .             *.                         .

*/
import cache from 'webext-storage-cache';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';
import delegate, {DelegateEvent} from 'delegate-it';

import features from '../feature-manager';
import {getRepo, getUsername} from '../github-helpers';

async function wiggleWiggleWiggle(): Promise<void> {
	await cache.set('did-it-wiggle', 'yup', {days: 7});
	select('#sponsor-button-repo')?.animate({
		transform: [
			'none',
			'rotate(-2deg) scale(1.05)',
			'rotate(2deg) scale(1.1)',
			'rotate(-2deg) scale(1.1)',
			'rotate(2deg) scale(1.1)',
			'rotate(-2deg) scale(1.1)',
			'rotate(2deg) scale(1.05)',
			'none',
		],
	}, 600);
}

async function suchLove({delegateTarget}: DelegateEvent): Promise<void> {
	const heart = select('.octicon-heart', delegateTarget);

	// .closest ensures that clicking the lightbox’ background doesn't also trigger the animation
	if (!heart || delegateTarget.closest('details[open]')) {
		return;
	}

	const rect = heart.getBoundingClientRect();
	const love = heart.cloneNode(true);
	Object.assign(love.style, {
		position: 'fixed',
		zIndex: '9999999999',
		left: `${rect.x}px`,
		top: `${rect.y}px`,
	});

	document.body.append(love);

	await love.animate({
		transform: [
			'translateZ(0)',
			'translateZ(0) scale(80)',
		],
		opacity: [
			1,
			0,
		],
	}, {
		duration: 600,
		easing: 'ease-out',
	}).finished;

	love.remove(); // 💔
}

async function handleNewIssue(signal: AbortSignal): Promise<false> {
	if (getRepo()!.owner !== getUsername() && !await cache.get('did-it-wiggle')) {
		select([
			'.btn-primary[href$="/issues/new/choose"]',
			'.btn-primary[href$="/issues/new"]',
		])
			?.addEventListener('mouseenter', wiggleWiggleWiggle, {once: true, signal});
	}

	return false;
}

function handleSponsorButton(signal: AbortSignal): void {
	delegate(document, '#sponsor-button-repo, #sponsor-profile-button, [aria-label^="Sponsor @"]', 'click', suchLove, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isIssue,
		pageDetect.isRepoIssueList,
	],
	awaitDomReady: true, // 🤷‍♂️
	init: handleNewIssue,
}, {
	include: [
		pageDetect.hasRepoHeader,
		pageDetect.isUserProfile,
		pageDetect.isOrganizationProfile,
	],
	exclude: [
		pageDetect.isOwnUserProfile,
		pageDetect.isPrivateUserProfile,
	],
	init: handleSponsorButton,
});
