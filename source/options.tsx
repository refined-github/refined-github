import fitTextarea from 'fit-textarea';
import OptionsSync from 'webext-options-sync';
import indentTextarea from 'indent-textarea';

fitTextarea.watch('textarea');
indentTextarea.watch('textarea');

new OptionsSync().syncForm('#options-form');
