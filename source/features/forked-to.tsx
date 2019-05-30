import './more-dropdown.css';
import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

async function init(): Promise<void> {
	const forkDialog = select<HTMLElement>('details-dialog[src*="/fork"]')!;
	const forkFragmentUrl = forkDialog.getAttribute('src')!;

	const forkFragment = select<HTMLElement>('include-fragment', forkDialog)!;
	forkFragment.addEventListener('load', () => onFragmentLoaded(forkDialog));
	forkFragment.setAttribute('src', forkFragmentUrl); // This will load the fork fragment.
}

function onFragmentLoaded(parent: HTMLElement): void {
	const pageheader = select<HTMLElement>('.pagehead h1.public')!;

	for (const forkElm of select.all<HTMLElement>('.octicon-repo-forked', parent)) {
		const forkName = forkElm.parentNode!.textContent!.trim();

		pageheader.append(
			<span className={'fork-flag'} data-repository-hovercards-enabled>
				<span className={'text'}>forked to&nbsp;
					<a data-hovercard-type="repository" data-hovercard-url={`/${forkName}/hovercard`} href={`/${forkName}`}>
						{forkName}
					</a>
				</span>
			</span>
		);
	}
}

features.add({
	id: 'forked-to',
	description: 'Add link to forked repo below the original',
	include: [
		features.isRepo
	],
	load: features.onAjaxedPages,
	init
});
