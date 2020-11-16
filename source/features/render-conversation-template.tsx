import './render-conversation-template.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import { flatZip } from 'flat-zip';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';
import concatRegex from '../helpers/concat-regex';
import fitTextarea from 'fit-textarea';

/* Like `string.split(regex)`, except that it ignores regex groups */
function betweenMatches(string: string, regex: RegExp) {
	const matches = [...string.matchAll(regex)];
	const between = [];
	for (const [index, match] of matches.entries()) {
		if (index === 0 && match.index !== 0) {
			between.push(string.slice(0, match.index))
		}

		between.push(string.slice(
			match.index! + match[0].length,
			matches[index + 1]?.index
		));
	}

	return between;
}

const placeholder = '%%%#%%%';
const regex = concatRegex(
	/(?<initial>^|\n\n)/, // At the beginning or at the start of a paragraph
	/(?<formatting>\*\*|#+\s+)/, // Bold or heading
	/(?<label>[^\n]+)/g // Capture the header/label
);

/** Render using GitHub’s "Preview" feature */
async function markdownToHTML(markdown: string): Promise<string> {
	const token = select<HTMLInputElement>('.js-data-preview-url-csrf')!.value;

	const body = new FormData();
	body.set('text', markdown);
	body.set('authenticity_token', token);

	const url = select('[data-preview-url]')!.dataset.previewUrl!;
	const response = await fetch(url, {body, method: 'post'});
	return response.text();
}

function generateForm(html: string): Element {
	// The classes try to match the spacing from `originalField`
	const renderedTemplate = <div className="rgh-render-conversation-template markdown-body mx-0 pt-2 mb-2 mx-md-2 border-top"/>;
	renderedTemplate.innerHTML = html.replaceAll(placeholder, '<textarea class="form-control input-contrast"></textarea>');

	// Move the text immediately following the field to the field’s placeholder
	for (const field of select.all('textarea', renderedTemplate)) {
		field.value = field.parentElement!.textContent!.trim();
		while (field.nextSibling) {
			field.nextSibling.remove();
		}
	}

	return renderedTemplate;
}

async function init(): Promise<void | false> {
	const originalField = select<HTMLTextAreaElement>('.js-comment-field')!;

	const [dynamicallyInjectedCommitText, template] = originalField.value.split('<!-- Please follow the template -->');
	if (!template) {
		return false;
	}

	// This will let us place the textarea’s values back into this string before submission
	const labels = [...template.matchAll(regex)].map(match => (
		<h3>
			{match.groups?.label.replace(/\*\*$/, '')}
		</h3>
	));

	const values = betweenMatches(template, regex).map(value => {
		console.log(value);

		const nodes = [];
		value = value.replace(/<!--(.+)-->/, (_, comment) => {
			nodes.push(<p>{comment}</p>);
			return '';
		});
		nodes.push(<textarea style={{minHeight: 0}}>{value.trim()}</textarea>);
		return nodes;
	});

	const renderedTemplate = <div className="comment-body markdown-body">{...flatZip<JSX.Element | JSX.Element[]>([labels, values]).flat()}</div>;
	select('markdown-toolbar')!.before(renderedTemplate);
	renderedTemplate.parentElement!.classList.add('flex-lg-column')

	// Set commit text back into the field
	textFieldEdit.set(originalField, dynamicallyInjectedCommitText);

	// Focus first textarea
	select('textarea', renderedTemplate)!.focus();

	for (const field of select.all('textarea', renderedTemplate)) {
		fitTextarea(field);
	}

	// Merge textareas
	// TODO: Do this every time the preview is generated (before it's sent to GitHub)
	originalField.form!.addEventListener('submit', () => {
		const fields = select.all('textarea', renderedTemplate);
		let counter = 0;
		const filledTemplate = templateWithPlaceholders
			.replaceAll(placeholder, () => fields[counter++].value);

		originalField.value = filledTemplate + '\n\n' + originalField.value;

		// Once the text is visibly merged for submission, the rendered template is no longer necessary
		renderedTemplate.remove();
	});
}

void features.add(__filebasename, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isQuickPR,
		// TODO: Merge with above
		() => pageDetect.isCompare() && location.search.includes('expand=1')
	],
	init: onetime(init)
});
