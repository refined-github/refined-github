import './overlay.css';

import React from 'dom-chef';

export default async function showOverlay(content: string | JSX.Element): Promise<void> {
	const overlay = <div className="rgh-overlay">{content}</div>;
	document.body.append(overlay);
	await overlay.animate(
		[{opacity: 1}, {opacity: 0}],
		{
			duration: 300,
			delay: 2000,
			easing: 'ease-in',
			fill: 'forwards',
		},
	).finished;
	overlay.remove();
}
