import './options.css';
import React from 'dom-chef';
import select from 'select-dom';
import fitTextarea from 'fit-textarea';
import {applyToLink} from 'shorten-repo-url';
import indentTextarea from 'indent-textarea';
import {getAllOptions} from './options-storage';
import * as domFormatters from './libs/dom-formatters';
import debounce from 'debounce-fn';

function parseDescription(description: string): DocumentFragment {
	const descriptionElement = <span>{description}</span>;
	domFormatters.linkifyIssues(descriptionElement, {
		baseUrl: 'https://github.com',
		user: 'sindresorhus',
		repository: 'refined-github'
	});
	domFormatters.linkifyURLs(descriptionElement);
	domFormatters.parseBackticks(descriptionElement);

	for (const a of select.all('a', descriptionElement)) {
		applyToLink(a);
	}

	return descriptionElement;
}

function buildFeatureCheckbox({name, description, screenshot, disabled}: FeatureInfo, index: Number): HTMLElement {
	// `undefined` disconnects it from the options
	const key = disabled ? undefined : `feature:${name}`;

	const disabledText = disabled ?
		<small>{parseDescription(`(Disabled because of ${disabled}) `)}</small> :
		false;

	return (
		<div className="feature" data-index={index}>
			<input type="checkbox" name={key} id={name} disabled={Boolean(disabled)} />
			<div className="info">
				<label for={name}>
					<span className="feature-name">{name}</span>
					{' '}
					{disabledText}
					<a href={`https://github.com/sindresorhus/refined-github/blob/master/source/features/${name}.tsx`}>
						source
					</a>
					{screenshot ? <>, <a href={screenshot}>screenshot</a></> : ''}
					<br/>
					<p className="description">{parseDescription(description)}</p>
				</label>
			</div>
		</div>
	);
}

function addSearch(): void {
	const searchInput = select<HTMLInputElement>('input[name="search-features"]')!;

	const separators = /\s/;
	const ignoredCharacters = /[,.:;'"’`]/g;
	const convertToSpace = /[-]/;
	const replaceCharacters = (string:string): string => (
		string.toLowerCase().replace(convertToSpace, ' ').replace(ignoredCharacters, '')
	)

	const plainMatch = (pattern:string[], text:string, matchAll:boolean): boolean => (
		matchAll
			?	pattern.every((str:string) => text.includes(str))
			: pattern.some((str:string) => text.includes(str))
	);

	const searchHandler = (event: Event): void => {
		const pattern = (event.target as HTMLInputElement).value || '';
		const patternArray = replaceCharacters(pattern)
			.split(separators)
			.filter(s => s); // remove empty strings
		const hasPattern = pattern !== '';
		// use quotes to get an exact match
		const matchAll = pattern.includes('"');

		for (const feature of select.all('.feature')) {
			if (feature) {
				let show = true;
				if (hasPattern) {
					const index = Number(feature.dataset.index);
					const featureObj = __featuresInfo__[index]; // minimize DOM interaction
					// show = fuzzyMath(pattern, patternLength, `${featureObj.name} ${featureObj.description}`);
					show = plainMatch(
						patternArray,
						replaceCharacters(`${featureObj.name} ${featureObj.description}`),
						matchAll
					);

					// console.log(index, featureObj.name, show)
				}
				feature.style.display = show ? '' : 'none';
			}
		}
	};

	searchInput.addEventListener('search', debounce(searchHandler, {wait: 200}));
	searchInput.addEventListener('keydown', debounce(searchHandler, {wait: 200}));
}

async function init(): Promise<void> {
	select('.js-features')!.append(...__featuresInfo__.map(buildFeatureCheckbox));

	const form = select('form')!;
	const optionsByDomain = await getAllOptions();
	await optionsByDomain.get('github.com')!.syncForm(form);

	fitTextarea.watch('textarea');
	indentTextarea.watch('textarea');

	// search feature options
	addSearch();

	// GitHub Enterprise domain picker
	if (optionsByDomain.size > 1) {
		const dropdown = (
			<select>
				{[...optionsByDomain.keys()].map(domain => <option value={domain}>{domain}</option>)}
			</select>
		) as unknown as HTMLSelectElement;
		form.before(<p>Domain selector: {dropdown}</p>, <hr/>);
		dropdown.addEventListener('change', event => {
			for (const [domain, options] of optionsByDomain) {
				if (dropdown.value === domain) {
					options.syncForm(form);
				} else {
					options.stopSyncForm();
				}
			}

			const newHost = (event.target as HTMLInputElement).value;
			select<HTMLAnchorElement>('#personal-token-link')!.host = newHost;
		});
	}

	// Move minimized users input field below the respective feature checkbox
	select('[for="minimize-user-comments"]')!.after(select('.js-minimized-users-container')!);
}

init();
