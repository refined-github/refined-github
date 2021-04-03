import React from 'dom-chef';
import cache from 'webext-storage-cache';

import features from '../features';

export default async function bisectFeatures(): Promise<Record<string, boolean>> {
	const bisectedFeatures: string[] | false | undefined = await cache.get('bisect');
	if (bisectedFeatures === undefined) {
		return {};
	}

	if (bisectedFeatures === false) {
		createMessageBox('Every feature has been disabled. If you still see the bug, try disabling the whole extension.', false);
		return {};
	}

	const firstHalf = bisectedFeatures.slice(0, Math.ceil(bisectedFeatures.length / 2));
	if (firstHalf.length === 0) {
		createMessageBox('Every feature has been disabled. Can you see the bug?');
	} else if (firstHalf.length === 1) {
		createMessageBox(<span>The bug is caused by <a href={'https://github.com/sindresorhus/refined-github/blob/main/source/features/' + firstHalf[0] + '.tsx'}><code>{firstHalf[0]}</code></a>.</span>, false);
	} else {
		createMessageBox(`${Math.ceil(Math.log2(firstHalf.length))} steps remaining. Can you see the bug?`);
	}

	return Object.fromEntries(features.list.map(feature => [`feature:${feature}`, firstHalf.includes(feature)]));
}

function createMessageBox(message: string | Element, yesNoButtons = true): void {
	document.body.append(
		<div className="Box" style={{position: 'fixed', top: 0, left: 0}}>
			<p>{message}</p>
			{yesNoButtons ? <button type="button" className="btn btn-danger" onClick={onChoiceButtonClick} value="no">No</button> : undefined}
			{yesNoButtons ? <button type="button" className="btn btn-primary" onClick={onChoiceButtonClick} value="yes">Yes</button> : undefined}
			{yesNoButtons ? undefined : <button type="button" className="btn btn-primary" onClick={onEndButtonClick}>End</button>}
		</div>
	);
}

async function onChoiceButtonClick({target}: MouseEvent): Promise<void> {
	const answer = (target as HTMLButtonElement).value;
	let bisectedFeatures: string[] | false | undefined = await cache.get('bisect');
	if (!bisectedFeatures) {
		return;
	}

	if (bisectedFeatures.length === 0) {
		bisectedFeatures = answer === 'yes' ? false : features.list;
	} else {
		const half = Math.ceil(bisectedFeatures.length / 2);
		bisectedFeatures = answer === 'yes' ? bisectedFeatures.slice(0, half) : bisectedFeatures.slice(half);
	}

	await cache.set('bisect', bisectedFeatures);
	location.reload();
}

async function onEndButtonClick(): Promise<void> {
	await cache.delete('bisect');
	await browser.runtime.sendMessage({reloadTab: true});
}
