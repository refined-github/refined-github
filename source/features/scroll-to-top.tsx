import './scroll-to-top.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import ChevronUpIcon from 'octicons-plain-react/ChevronUp';

import features from '../feature-manager.js';

function add(): void {
	const button = (
		<button
			type="button"
			className="rgh-scroll-to-top"
			aria-label="Scroll to top"
			hidden
		>
			<ChevronUpIcon />
		</button>
	);

	document.body.append(button);

	// Show/hide button based on scroll position
	window.addEventListener('scroll', () => {
		button.hidden = window.scrollY < window.innerHeight;
	});

	// Scroll to top when clicked
	button.addEventListener('click', () => {
		window.scrollTo({top: 0, behavior: 'smooth'});
	});
}

function init(): void {
	add();
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR,
	],
	init,
});

/*
Test URLs:
https://github.com/refined-github/refined-github/pull/1
*/
