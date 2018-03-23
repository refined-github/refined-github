import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

document.querySelector('[name="customCSS"]').addEventListener('keydown', event => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target);
		event.preventDefault();
	}
});

new OptionsSync().syncForm('#options-form');
