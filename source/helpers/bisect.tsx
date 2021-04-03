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
		return buildOptionsObject([]);
	}

	if (bisectedFeatures.length === 0) {
		createMessageBox('Every feature has been disabled. Can you see the bug?');
	} else if (bisectedFeatures.length === 1) {
		createMessageBox(<span>The bug is caused by <a href={'https://github.com/sindresorhus/refined-github/blob/main/source/features/' + bisectedFeatures[0] + '.tsx'}><code>{bisectedFeatures[0]}</code></a>.</span>, false);
	} else {
		createMessageBox(`Can you see the bug? (${Math.ceil(Math.log2(bisectedFeatures.length))} steps remaining.)`);
	}

	return buildOptionsObject(bisectedFeatures.slice(0, Math.ceil(bisectedFeatures.length / 2)));
}

function buildOptionsObject(enabledFeatures: string[]): Record<string, boolean> {
	return Object.fromEntries(features.list.map(feature => [`feature:${feature}`, enabledFeatures.includes(feature)]));
}

function createMessageBox(message: string | Element, yesNoButtons = true): void {
	document.body.append(
		<div className="Box p-3" style={{position: 'fixed', bottom: 10, left: '50%', transform: 'translateX(-50%)'}}>
			<p>{message}</p>
			<div className="d-flex flex-justify-between">
				<div>
					<button type="button" className="btn" onClick={onEndButtonClick}>Exit</button>
				</div>
				{yesNoButtons ?
					<div>
						<button type="button" className="btn btn-danger mr-2" value="no" onClick={onChoiceButtonClick}>No</button>
						<button type="button" className="btn btn-primary" value="yes" onClick={onChoiceButtonClick}>Yes</button>
					</div>
					: undefined
				}
			</div>
		</div>
	);
}

async function onChoiceButtonClick({currentTarget}: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	let bisectedFeatures: string[] | false | undefined = await cache.get('bisect');
	if (!bisectedFeatures) {
		return;
	}

	if (bisectedFeatures.length === 0) {
		bisectedFeatures = currentTarget.value === 'yes' ? false : features.list;
	} else {
		const half = Math.ceil(bisectedFeatures.length / 2);
		bisectedFeatures = currentTarget.value === 'yes' ? bisectedFeatures.slice(0, half) : bisectedFeatures.slice(half);
	}

	await cache.set('bisect', bisectedFeatures);
	location.reload();
}

async function onEndButtonClick(): Promise<void> {
	await cache.delete('bisect');
	location.reload();
}
