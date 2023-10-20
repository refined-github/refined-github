import React from 'dom-chef';
import {CachedValue} from 'webext-storage-cache';
import {$, $$} from 'select-dom';
import elementReady from 'element-ready';

import pluralize from './pluralize.js';
import featureLink from './feature-link.js';
import {importedFeatures} from '../../readme.md';

export const state = new CachedValue<FeatureID[]>('bisect', {maxAge: {minutes: 15}});

// Split current list of features in half and create an options-like object to be applied on load
// Bisecting 4 features: enable 2
// Bisecting 3 features: enable 1
// Bisecting 2 features: enable 1
// Bisecting 1 feature: enable 0 // This is the last step, if the user says Yes, it's not caused by a JS feature
const getMiddleStep = (list: any[]): number => Math.floor(list.length / 2);

async function onChoiceButtonClick({currentTarget: button}: React.MouseEvent<HTMLButtonElement>): Promise<void> {
	const answer = button.value;
	const bisectedFeatures = (await state.get())!;

	if (bisectedFeatures.length > 1) {
		await state.set(answer === 'yes'
			? bisectedFeatures.slice(0, getMiddleStep(bisectedFeatures))
			: bisectedFeatures.slice(getMiddleStep(bisectedFeatures)),
		);

		button.parentElement!.replaceWith(<div className="btn" aria-disabled="true">Reloading…</div>);
		location.reload();
		return;
	}

	// Last step, no JS feature was enabled
	if (answer === 'yes') {
		createMessageBox(
			<>
				<p>Unable to identify feature. It might be a <a href="https://github.com/refined-github/refined-github/wiki/Undo-unwanted-styles" target="_blank" rel="noreferrer">CSS-only feature</a>, a <a href="https://github.com/refined-github/refined-github/wiki/Meta-features" target="_blank" rel="noreferrer">meta-feature</a>, or unrelated to Refined GitHub.</p>
				<p>Try disabling Refined GitHub to see if the change or issue is caused by the extension.</p>
			</>);
	} else {
		const feature = (
			<a href={featureLink(bisectedFeatures[0])}>
				<code>{bisectedFeatures[0]}</code>
			</a>
		);

		createMessageBox(<>The change or issue is caused by {feature}.</>);
	}

	await state.delete();
	window.removeEventListener('visibilitychange', hideMessage);
}

async function onEndButtonClick(): Promise<void> {
	await state.delete();
	location.reload();
}

function createMessageBox(message: Element | string, extraButtons?: Element): void {
	$('#rgh-bisect-dialog')?.remove();
	document.body.append(
		<div id="rgh-bisect-dialog" className="Box p-3">
			<p>{message}</p>
			<div className="d-flex flex-justify-between">
				<button type="button" className="btn" onClick={onEndButtonClick}>Exit</button>
				{extraButtons}
			</div>
		</div>,
	);
}

async function hideMessage(): Promise<void> {
	if (!await state.get()) {
		createMessageBox('Process completed in another tab');
	}
}

export default async function bisectFeatures(): Promise<Record<string, boolean> | void> {
	// `bisect` stores the list of features to be split in half
	const bisectedFeatures = await state.get();
	if (!bisectedFeatures) {
		return;
	}

	console.log(`Bisecting ${bisectedFeatures.length} features:\n${bisectedFeatures.join('\n')}`);

	const steps = Math.ceil(Math.log2(Math.max(bisectedFeatures.length))) + 1;
	await elementReady('body');
	createMessageBox(
		`Do you see the change or issue? (${pluralize(steps, 'last step', '$$ steps remaining')})`,
		<div>
			<button type="button" className="btn btn-danger mr-2" value="no" aria-disabled="true" onClick={onChoiceButtonClick}>No</button>
			<button type="button" className="btn btn-primary" value="yes" aria-disabled="true" onClick={onChoiceButtonClick}>Yes</button>
		</div>,
	);

	// Enable "Yes"/"No" buttons once the page is done loading
	window.addEventListener('load', () => {
		for (const button of $$('#rgh-bisect-dialog [aria-disabled]')) {
			button.removeAttribute('aria-disabled');
		}
	});

	// Hide message when the process is done elsewhere
	window.addEventListener('visibilitychange', hideMessage);

	const half = getMiddleStep(bisectedFeatures);
	const temporaryOptions: Record<string, boolean> = {};
	for (const feature of importedFeatures) {
		const index = bisectedFeatures.indexOf(feature);
		temporaryOptions[`feature:${feature}`] = index > -1 && index < half;
	}

	console.log(temporaryOptions);
	return temporaryOptions;
}
