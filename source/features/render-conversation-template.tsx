import './render-conversation-template.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';

const placeholder = '%%%#%%%';

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
		field.placeholder = field.parentElement!.textContent!.trim();
		while (field.nextSibling) {
			field.nextSibling.remove();
		}
	}

	return renderedTemplate;
}

async function init(): Promise<void | false> {
	const originalField = select<HTMLTextAreaElement>('.js-comment-field')!;

	const [preservePRText, template] = originalField.value.split('<!-- Please follow the template -->');
	if (!template) {
		return false;
	}

	// This will let us place the textarea’s values back into this string before submission
	const templateWithPlaceholders = template
		.replaceAll(/:[*_\s]+\n/g, `$&\n${placeholder}`);

	// Makes comments visible, but only in the rendered template
	const renderableTemplate = templateWithPlaceholders
		.replaceAll('<!--', '')
		.replaceAll('-->', '');

	const renderedTemplate = generateForm(await markdownToHTML(renderableTemplate));
	select('markdown-toolbar')!.before(renderedTemplate);

	// Set original, template-less text back into the field
	textFieldEdit.set(originalField, preservePRText);

	// Focus first textarea
	select('textarea', renderedTemplate)!.focus();

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

void features.add({
	id: __filebasename
}, {
	include: [
		pageDetect.isNewIssue,
		pageDetect.isQuickPR,
		// TODO: Merge with above
		() => pageDetect.isCompare() && location.search.includes('expand=1')
	],
	init: onetime(init)
});
