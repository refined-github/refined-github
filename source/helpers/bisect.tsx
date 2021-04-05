import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';

import features from '../features';

export default async function bisectFeatures(): Promise<Record<string, boolean>> {
	const bisectedFeatures = await cache.get<FeatureID[]>('bisect');
	if (!bisectedFeatures) {
		return {};
	}

	const enabledFeatures = new Set(bisectedFeatures.slice(0, Math.ceil(bisectedFeatures.length / 2)));
	if (bisectedFeatures.length === 0) {
		createMessageBox(<p>Every feature has been disabled. Do you still see the change or issue?</p>);
	} else if (bisectedFeatures.length === 1) {
		createMessageBox(<p>The change or issue is caused by <a href={'https://github.com/sindresorhus/refined-github/blob/main/source/features/' + bisectedFeatures[0] + '.tsx'}><code>{bisectedFeatures[0]}</code></a>.</p>, false);
	} else {
		createMessageBox(<p>Can you see the change or issue? ({Math.ceil(Math.log2(bisectedFeatures.length))} steps remaining.)</p>);
	}

	return Object.fromEntries(features.list.map(feature => [`feature:${feature}`, enabledFeatures.has(feature)]));
}

function createMessageBox(message: Element, yesNoButtons = true): void {
	select('#rgh-bisect-dialog')?.remove();
	document.body.append(
		<div
			id="rgh-bisect-dialog"
			className="Box p-3"
			style={{
				position: 'fixed',
				bottom: '50%',
				right: '50%',
				maxWidth: '600px',
				transform: 'translate(50%, 50%)',
				boxShadow: 'var(--color-toast-shadow)',
				zIndex: 2147483647
			}}
		>
			{message}
			<div className="d-flex flex-justify-between">
				<div>
					<button type="button" className="btn" onClick={onEndButtonClick}>Exit</button>
				</div>
				{yesNoButtons ?
					<div>
						<button type="button" className="btn btn-danger mr-2" value="no" onClick={onChoiceButtonClick}>No</button>
						<button type="button" className="btn btn-primary" value="yes" onClick={onChoiceButtonClick}>Yes</button>
					</div> :
					undefined}
			</div>
		</div>
	);
}

async function onChoiceButtonClick({currentTarget}: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const answer = currentTarget.value;
	const bisectedFeatures = (await cache.get<FeatureID[]>('bisect'))!;
	if (!bisectedFeatures) {
		return;
	}

	if (bisectedFeatures.length === 0) {
		if (answer === 'yes') {
			createMessageBox(<p>Every feature has been disabled. If you still see the change or issue, try disabling the whole extension.</p>, false);
			return;
		}

		await cache.set('bisect', features.list);

		location.reload();
		return;
	}

	const half = Math.ceil(bisectedFeatures.length / 2);
	await cache.set('bisect', answer === 'yes' ? bisectedFeatures.slice(0, half) : bisectedFeatures.slice(half));

	location.reload();
}

async function onEndButtonClick(): Promise<void> {
	await cache.delete('bisect');
	location.reload();
}
