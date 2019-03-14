import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

fitTextarea.watch('textarea');

document.querySelector('[name="customCSS"]').addEventListener('keydown', (event: KeyboardEvent) => {
	if (event.key === 'Tab' && !event.shiftKey) {
		indentTextarea(event.target as HTMLTextAreaElement);
		event.preventDefault();
	}
});

new OptionsSync().syncForm('#options-form');
