import Textarea from 'storm-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

Textarea.init('textarea', {
	events: ['input'],
	paddingBottom: 2
});

document.querySelector('[name="customCSS"]').addEventListener('keydown', event => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target);
		event.preventDefault();
	}
});
document.querySelector('[name="customJS"]').addEventListener('keydown', event => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target);
		event.preventDefault();
	}
});

new OptionsSync().syncForm('#options-form');
