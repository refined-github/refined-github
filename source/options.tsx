import './options.css';
import React from 'dom-chef';
import select from 'select-dom';
import linkifyUrls from 'linkify-urls';
import fitTextarea from 'fit-textarea';
import linkifyIssues from 'linkify-issues';
import indentTextarea from 'indent-textarea';
import {applyToLink as shortenLink} from 'shorten-repo-url';
import editTextNodes from './libs/linkify-text-nodes';
import parseBackticks from './libs/parse-backticks';
import {getAllOptions} from './options-storage';

function parseDescription(description: string): DocumentFragment {
	const descriptionFragment = parseBackticks(description);
	editTextNodes(linkifyUrls, descriptionFragment);
	editTextNodes(linkifyIssues, descriptionFragment);

	for (const a of select.all('a', descriptionFragment)) {
		shortenLink(a, location.href);
	}

	return descriptionFragment;
}

function buildFeatureCheckbox({name, description, screenshot, disabled}: FeatureInfo): HTMLElement {
	// `undefined` disconnects it from the options
	const id = disabled ? undefined : `feature:${name}`;

	const parsedDescription = parseDescription(
		(disabled ? `Disabled because of ${disabled}; \n` : '') +
		description
	);

	return (
		<p>
			<input type="checkbox" name={id} id={id} disabled={Boolean(disabled)} />
			<label for={id} className="info">
				<span className="feature-name">{name}</span>
				{' '}
				<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
					source
				</a>
				{screenshot ? <>, <a href={screenshot}>screenshot</a></> : ''}
				<br/>
				<span className="description">{parsedDescription}</span>
			</label>
		</p>
	);
}

async function init(): Promise<void> {
	select('.js-features')!.append(...__featuresInfo__.map(buildFeatureCheckbox));

	const form = select('form')!;
	const optionsByDomain = await getAllOptions();
	await optionsByDomain.get('github.com')!.syncForm(form);

	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	if (optionsByDomain.size > 1) {
		const dropdown = (
			<select>
				{[...optionsByDomain.keys()].map(domain => <option value={domain}>{domain}</option>)}
			</select>
		) as any as HTMLSelectElement;
		form.before(<p>Domain selector: {dropdown}</p>, <hr/>);
		dropdown.addEventListener('change', () => {
			for (const [domain, options] of optionsByDomain) {
				if (dropdown.value === domain) {
					options.syncForm(form);
				} else {
					options.stopSyncForm(form);
				}
			}
		});
	}
}

init();
