import {h} from 'dom-chef';
import textarea from 'storm-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

textarea('textarea', {
	events: ['input']
});

document.querySelector('[name="customCSS"]').addEventListener('keydown', event => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target);
		event.preventDefault();
	}
});

const optionsSync = new OptionsSync();
optionsSync.define({
	defaults: {
		personalTokens: {},
	},
	migrations: [
		// migrate personal token to object
		(savedOptions, currentDefaults) => {
			if(savedOptions.personalToken) {
				savedOptions.personalTokens = {
					'github.com': savedOptions.personalToken
				};
				delete savedOptions.personalToken;
			}
		},
		OptionsSync.migrations.removeUnused
	]
});

const tokenInputList = document.querySelector('#tokens');

function updateTokenForm() {
	// clear children
	while (tokenInputList.firstChild) {
		tokenInputList.removeChild(tokenInputList.firstChild);
	}

	optionsSync.getAll().then(options => {
		const tokens = options.personalTokens;
		const tokenKeys = Object.keys(tokens);
		if(tokenKeys.length !== 0) {
			const tokenInputs = tokenKeys.map(hostName => generateTokenInputRow(hostName, tokens[hostName]))
			tokenInputs.forEach(input => tokenInputList.appendChild(input))
		}
	});
}

function updateHostName(oldHostName, event) {
	const newHostName = event.target.value;
	optionsSync.getAll().then(options => {
		var value = options.personalTokens[oldHostName];
		options.personalTokens[newHostName] = value;
		delete options.personalTokens[oldHostName];
		optionsSync.setAll(options);
	});
}

function updateTokenValue(hostName, event) {
	const newValue = event.target.value;
	optionsSync.getAll().then(options => {
		options.personalTokens[hostName] = newValue;
		optionsSync.setAll(options);
	});
}

function removeHost(hostname) {
	optionsSync.getAll().then(options => {
		delete options.personalTokens[hostname];
		optionsSync.setAll(options);
		updateTokenForm();
	});
}

function generateTokenInputRow(hostName, value) {
	const hostnameInput = (
		<input
			style={{width: '100px'}}
			spellcheck="false"
			autocomplete="off"
			pattern="^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])"
			placeholder="hostname"
			value={hostName}
		/>
	);
	hostnameInput.onchange = (event) => updateHostName(hostName, event);

	const tokenInput = (
		<input
			spellcheck="false"
			autocomplete="off"
			size="40"
			maxlength="40"
			pattern="[\da-f]{40}"
			placeholder="personal token"
			value={value}
		/>
	);
	tokenInput.onchange = (event) => updateTokenValue(hostName || hostnameInput.value, event);

	const removeButton = <button type="button">X</button>;
	removeButton.onclick = () => removeHost(hostName);

	return (
		<div style={{display: 'flex', marginBottom: '8px'}}>
			{hostnameInput} : {tokenInput} {removeButton}
		</div>
	);
}

function addPersonalKeyRow() {
	// get the hostname of the active tab
	chrome.tabs.query({
		active: true,
		currentWindow: true
	}, function(tabs) {
		var tab = tabs[0];
		var url = tab.url;
		var l = document.createElement("a");
		l.href = url;

		const currHost = l.hostname;

		optionsSync.getAll().then(options => {
			if(options.personalTokens[currHost]) {
				// if they already have a value for the host, make an empty input
				tokenInputList.appendChild(generateTokenInputRow('', ''));
			} else {
				// append input with hostname already filled
				tokenInputList.appendChild(generateTokenInputRow(currHost, ''));
			}
		});
		
	});
}

const addButton = <button type="button">Add token</button>;
addButton.onclick = addPersonalKeyRow;

document.querySelector('#token-wrapper').appendChild(addButton)

// init token input
updateTokenForm();

optionsSync.syncForm('#options-form');
