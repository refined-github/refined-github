import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
    registerShortcut('issues', 'ArrowRight', 'Go to the next page.');
    const createNextPageButton = select('a.next_page');
    if (createNextPageButton) {
        createNextPageButton.setAttribute('data-hotkey', 'ArrowRight')
    }
    registerShortcut('issues', 'ArrowLeft', 'Go to the previous page.');
    const createPreviousPageButton = select('a.previous_page');
    if (createPreviousPageButton) {
        createPreviousPageButton.setAttribute('data-hotkey', 'ArrowLeft')
    }
}