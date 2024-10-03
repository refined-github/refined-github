import 'webext-base-css/webext-base.css';
import './welcome.css';
import {expectElement as $} from 'select-dom';
import {perDomainOptions} from './options-storage.js';

const origins = ['https://github.com/*', 'https://gist.github.com/*'];

// Only now the form is ready, we can show it
$('#js-failed').remove();

function showThirdStep(): void {
	$('[data-validation]:nth-child(3)').style.animationPlayState = 'running';
}

function markSecondStep(): void {
	setTimeout(() => {
		$('[data-validation]:nth-child(2)').dataset.validation = 'valid'; 
	}, 1000);
}

function unwrapGrantButton(): void {
	$('#access').replaceWith('Grant');
	$('[data-validation]:nth-child(1)').dataset.validation = 'valid'; 
	$('[data-validation]:nth-child(2)').style.animationPlayState = 'running';
	$('[data-validation]:nth-child(2)').addEventListener('click', showThirdStep, {once: true});
	$('#personal-token-link').addEventListener('click', markSecondStep, {once: true});

	setTimeout(showThirdStep, 4000);

}

async function grantPermissions(): Promise<void> {
	const granted = await chrome.permissions.request({
		origins,
	});
	if (granted) {
		unwrapGrantButton();
	};
}

async function init(): Promise<void> {
	if (await chrome.permissions.contains({origins})) {
		unwrapGrantButton();
	} else {
		$('#access').addEventListener('click', grantPermissions);
	}
	
	await perDomainOptions.syncForm('form');
}

// TODO DELME
setTimeout(unwrapGrantButton, 1000);

void init();
