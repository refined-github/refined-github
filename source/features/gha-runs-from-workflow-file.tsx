import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';

const isWorkflowFile = (): boolean => (location.pathname.endsWith('.yaml') && location.pathname.split('/', 7)[5] == ".github"  && location.pathname.split('/', 7)[6] == "workflows");

function init(): void {
  
  const actionName = 
	select.all('.blob-code-inner')
		.find(line => line.textContent.startsWith('name'))
		.textContent
		.replace(/^name:\s+/, '')
		.replace('"', '')
		.replace("'", '')
		.trim();
	const rawButton = select<HTMLAnchorElement>('#raw-url')!;
	const link = location.pathname.split('/', 7);
	
	const actionURL = `https://github.com/${link[1]}/${link[2]}/actions?query=workflow%3A${encodeURIComponent(actionName)}`;
	
	console.log(actionURL);
	
	rawButton
		.parentElement! // `BtnGroup`
		.prepend(
			<a
				className="btn btn-sm BtnGroup-item"
				href={actionURL}
			>
				See runs
			</a>
		);
}

features.add({
	id: __featureName__,
	description: 'Adds a link to view Action workflow in action.',
	screenshot: 'https://user-images.githubusercontent.com/44045911/67634792-48995980-f8fb-11e9-8b6a-7b57d5b12a2f.png'
}, {
	include: [
	  features.isSingleFile,
	  isWorkflowFile
	],
	exclude: [
		features.isEnterprise
	],
	init
});
