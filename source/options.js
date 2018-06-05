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

new OptionsSync().syncForm('#options-form');
