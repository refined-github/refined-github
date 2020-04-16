//import React from 'dom-chef';
//import select from 'select-dom';
import features from '../libs/features';

const isWorkflowFile = (): boolean => (location.pathname.endsWith('.yaml') && location.pathname.split('/', 7)[5] == ".github"  && location.pathname.split('/', 7)[6] == "workflows");

function init(): void {
  const actionName = 
  	document.body('.blob-code-inner')
  		.find(line => line.textContent.startsWith('name'))
  		.textContent
  		.replace(/^name:\s+/, '')
  		.trim();
	console.log(actionName)
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
