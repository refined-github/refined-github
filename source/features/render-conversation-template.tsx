import './render-conversation-template.css';
import React from 'dom-chef';
import select from 'select-dom';
import onetime from 'onetime';
import {flatZip} from 'flat-zip';
import * as pageDetect from 'github-url-detection';
import * as textFieldEdit from 'text-field-edit';

import fitTextarea from 'fit-textarea';

import features from '.';
import concatRegex from '../helpers/concat-regex';

const trimNewLines = (string: string): string => string.replace(/^\n+|\n+$/g, '')

/* Like `string.split(regex)`, except that it ignores regex groups */
function betweenMatches(string: string, regex: RegExp): string[] {
	const matches = [...string.matchAll(regex)];
	const between = [];
	for (const [index, match] of matches.entries()) {
		if (index === 0 && match.index !== 0) {
			between.push(string.slice(0, match.index));
		}

		between.push(string.slice(
			match.index! + match[0].length,
			matches[index + 1]?.index
		));
	}

	return between;
}

const regex = concatRegex(
	/(?<initial>^|\n\n)/, // At the beginning or at the start of a paragraph
	/(?<formatting>\*\*|#+\s+)/, // Bold or heading
	/(?<label>[^\n]+)/g // Capture the header/label
);

async function init(): Promise<void | false> {
	const originalField = select<HTMLTextAreaElement>('.js-comment-field')!;

	const [dynamicallyInjectedCommitText, template] = originalField.value.split(/<!-- Please follow the template -->\n+/);
	if (!template) {
		return false;
	}

	// This will let us place the textarea’s values back into this string before submission
	const labelMatches = [...template.matchAll(regex)];
	const labels = labelMatches.map(match => (
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
		nodes.push(
			<textarea className="form-control input-contrast" style={{minHeight: 0}}>
				{trimNewLines(value)}
			</textarea>
		);
		return nodes;
	});

	// The classes try to match the spacing from `originalField`
	const renderedTemplate = <div className="rgh-render-conversation-template markdown-body mx-0 pt-2 mb-2 mx-md-2 border-top"/>;
	renderedTemplate.append(...flatZip<JSX.Element | JSX.Element[]>([labels, values]).flat())
	select('markdown-toolbar')!.before(renderedTemplate);
	renderedTemplate.parentElement!.classList.add('flex-lg-column');

	// Set commit text back into the field
	textFieldEdit.set(originalField, dynamicallyInjectedCommitText);

	// Focus first textarea
	select('textarea', renderedTemplate)!.focus();

	for (const field of select.all('textarea', renderedTemplate)) {
		fitTextarea(field);
	}

	// Merge textareas
	// TODO: Do this every time the preview is generated (before it's sent to GitHub)
	const apply = (): void => {
		const fields = select.all('textarea', renderedTemplate);
		const filledTemplate = flatZip([
			labelMatches.map(([match]) => trimNewLines(match)),
			fields.map(field => field.value)
		]);

		// originalField.value = filledTemplate + '\n\n' + originalField.value;
		console.clear();

		console.log(filledTemplate.join('\n\n') + '\n\n' + originalField.value);

		// Once the text is visibly merged for submission, the rendered template is no longer necessary
		// renderedTemplate.remove();
	};

	originalField.form!.addEventListener('submit', apply);
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
