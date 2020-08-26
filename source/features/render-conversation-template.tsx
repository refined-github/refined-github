import './render-conversation-template.css';
import doma from 'doma';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import features from '.';

async function init(): Promise<void | false> {
	const placeholder = '%%%#%%%';
	const originalField = select<HTMLTextAreaElement>('.js-comment-field')!;

	const [preservePRText, template] = originalField
		.value
		.split('<!-- Please follow the template -->');
	if (!template) {
		return false;
	}

	// Prepare data
	const token = select<HTMLInputElement>('.js-data-preview-url-csrf')!.value;
	const templateWithPlaceholders = template
		.replaceAll(/:[*_\s]+\n/g, `$&\n${placeholder}`);
	const renderableTemplate = templateWithPlaceholders
		.replaceAll('<!--', '')
		.replaceAll('-->', '');

	const body = new FormData();
	body.set('text', renderableTemplate);
	body.set('authenticity_token', token);

	// Render
	const url = select('[data-preview-url]')!.dataset.previewUrl!;
	const response = await fetch(url, {body, method: 'post'});
	const html = await response.text();

	const customizedHTML = html.replaceAll(placeholder, '<textarea class="form-control input-contrast"></textarea>');
	const renderedTemplate = (
		<div className="rgh-render-conversation-template markdown-body mx-0 pt-2 mb-2 mx-md-2 border-top">
			{doma(customizedHTML)}
		</div>
	);
	select('markdown-toolbar')!.before(renderedTemplate);

	for (const field of select.all('textarea', renderedTemplate)) {
		field.placeholder = field.parentElement!.textContent!.trim();
		while (field.nextSibling) {
			field.nextSibling.remove();
		}
	}

	textFieldEdit.set(originalField, preservePRText);

	// Focus first textarea
	select('textarea', renderedTemplate)!.focus();

	// Merge textareas
	// TODO: Do this every time the preview is generated (before it's sent to GitHub)
	originalField.form!.addEventListener('submit', () => {
		const fields = select.all('textarea', renderedTemplate);
		let counter = 0;
		originalField.value = templateWithPlaceholders
			.replaceAll(placeholder, () => fields[counter++].value);

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
