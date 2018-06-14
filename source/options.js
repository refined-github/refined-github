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

document.querySelector('[name="personalToken"]').addEventListener('keyup', event => {
	if (event.target.value) {
		event.target.dataset.empty = 'false';
	} else {
		event.target.dataset.empty = 'true';
	}
});

new OptionsSync().syncForm('#options-form');
