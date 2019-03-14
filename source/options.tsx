import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from './libs/indent-textarea';

fitTextarea.watch('textarea');

document.querySelector('[name="customCSS"]')!.addEventListener('keydown', event => {
	const tsEvent = event as KeyboardEvent;
	if (tsEvent.key === 'Tab' && !tsEvent.shiftKey) {
		indentTextarea(tsEvent.target as HTMLTextAreaElement);
		tsEvent.preventDefault();
	}
});

new OptionsSync().syncForm('#options-form');
