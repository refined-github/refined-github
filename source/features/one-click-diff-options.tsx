import React from 'dom-chef';
import select from 'select-dom';
import delegate, {DelegateEvent} from 'delegate-it';
import * as pageDetect from 'github-url-detection';
import {BookIcon, CheckIcon, DiffIcon, DiffModifiedIcon} from '@primer/octicons-react';

import features from '../feature-manager';
import attachElement from '../helpers/attach-element';
import observe from '../helpers/selector-observer';
import {removeTextNode} from '../helpers/dom-utils';

const diffSwitchButtons = features.getIdentifiers(import.meta.url);

function alternateDiffNatively(event: DelegateEvent<MouseEvent, HTMLAnchorElement>): void {
	const type = new URLSearchParams(event.delegateTarget.search).get('diff')!;
	const formField = select(`input#diff_${type}`);
	if (!formField) {
		// Let the link through
		return;
	}

	// Submit form so that the preference is persisted #5288
	formField.checked = true;
	formField.form!.submit();
	event.preventDefault();
}

function makeLink(type: string, icon: Element, selected: boolean): JSX.Element {
	const url = new URL(location.href);
	url.searchParams.set('diff', type);
	const classes = pageDetect.isPR()
		? 'ml-2 color-fg-muted'
		: 'btn btn-sm BtnGroup-item ' + (selected ? 'selected' : '');

	return (
		<a
			className={`tooltipped tooltipped-s ${classes} ${diffSwitchButtons.class}`}
			aria-label={`Switch to the ${type} diff view`}
			href={url.href}
		>
			{icon}
		</a>
	);
}

function createDiffStyleToggle(): DocumentFragment {
	const isUnified = select.exists([
		'[value="unified"][checked]', // Form in PR
		'.table-of-contents .selected[href*="diff=unified"]', // Link in single commit
	]);

	if (pageDetect.isPR()) {
		return isUnified
			? makeLink('split', <BookIcon className="v-align-middle"/>, false)
			: makeLink('unified', <DiffIcon className="v-align-middle"/>, false);
	}

	return (
		<>
			{makeLink('unified', <DiffIcon/>, isUnified)}
			{makeLink('split', <BookIcon/>, !isUnified)}
		</>
	);
}

function isHidingWhitespace(): boolean {
	// The selector is the native button
	return new URL(location.href).searchParams.get('w') === '1' || select.exists('button[name="w"][value="0"]:not([hidden])');
}

function createWhitespaceButton(): HTMLElement {
	const url = new URL(location.href);

	if (isHidingWhitespace()) {
		url.searchParams.delete('w');
	} else {
		url.searchParams.set('w', '1');
	}

	const classes = pageDetect.isPR()
		? 'tooltipped tooltipped-s color-fg-muted'
		: 'tooltipped tooltipped-s btn btn-sm tooltipped ' + (isHidingWhitespace() ? 'color-fg-subtle' : '');

	return (
		<a
			href={url.href}
			data-hotkey="d w"
			className={classes}
			aria-label={`${isHidingWhitespace() ? 'Show' : 'Hide'} whitespace changes`}
		>
			{pageDetect.isPR() ? <DiffModifiedIcon className="v-align-middle"/> : <>{isHidingWhitespace() && <CheckIcon/>} No Whitespace</>}
		</a>
	);
}

function attachPRButtons(diffSettings: HTMLElement): void {
	// TODO: Replace with :has()
	const originalToggle = diffSettings.closest('details')!.parentElement!;

	const classes = 'diffbar-item d-flex hide-sm hide-md';

	if (!isHidingWhitespace()) {
		originalToggle.after(
			<div className={classes}>{createWhitespaceButton()}</div>,
		);
	}

	originalToggle.after(
		<div className={classes}>{createDiffStyleToggle()}</div>,
	);

	originalToggle.remove();

	// Trim title
	const prTitle = select('.pr-toolbar .js-issue-title');
	if (prTitle && select.exists('.pr-toolbar progress-bar')) { // Only review view has progress-bar
		prTitle.style.maxWidth = '24em';
		prTitle.title = prTitle.textContent!;
	}

	// Make space for the new button #655
	removeTextNode(
		select('[data-hotkey="c"] strong')!.previousSibling!,
		'Changes from',
	);

	// Remove extraneous padding around "Clear filters" button
	select('.subset-files-tab')?.classList.replace('px-sm-3', 'ml-sm-2');
}

function initPR(signal: AbortSignal): void {
	// There are two "diff settings" element, one for mobile and one for the desktop. We only replace the one for the desktop
	observe('.hide-sm.hide-md [aria-label="Diff settings"]', attachPRButtons, {signal});
	delegate(document, diffSwitchButtons.selector, 'click', alternateDiffNatively, {signal});
}

function attachButtons(nativeDiffButtons: HTMLElement): void {
	// TODO: Replace with :has()
	const anchor = nativeDiffButtons.parentElement;

	// `usesFloats` is necessary to ensure the order and spacing as seen in #5958
	const usesFloats = anchor?.classList.contains('float-right');
	attachElement(anchor, usesFloats ? {
		after: () => (
			<div className="float-right mr-3">
				{createWhitespaceButton()}
			</div>
		),
	} : {
		before: createWhitespaceButton,
	});
}

function init(signal: AbortSignal): void {
	observe('[action="/users/diffview"]', attachButtons, {signal});
}

const shortcuts = {
	'd w': 'Show/hide whitespaces in diffs',
};

void features.add(import.meta.url, {
	shortcuts,
	include: [
		pageDetect.isPRFiles,
		pageDetect.isPRCommit,
	],
	exclude: [
		pageDetect.isPRFile404,
		pageDetect.isEnterprise, // #5820
	],
	init: initPR,
}, {
	shortcuts,
	include: [
		pageDetect.isSingleCommit,
		pageDetect.isCompare,
	],
	awaitDomReady: false,
	init,
});

/*
# Test URLs

- Compare, in "Files changed" tab: https://github.com/rancher/rancher/compare/v2.6.3...v2.6.6
- Compare, without tab: https://github.com/rancher/rancher/compare/v2.6.5...v2.6.6
- Single commit: https://github.com/rancher/rancher/commit/e82921075436c21120145927d5a66037661fcf4e

*/
