import select from 'select-dom';
import features from '../libs/features';

const childList = {childList: true};

// To push new extensions if we want more file types to have rich diff as default
const richDiffExtensions = ['svg'];

const fileExtensionRegExp = new RegExp('\\.(' + richDiffExtensions.join('|') + ')$');

const checkFileIsRichDiffable = (filename: string): boolean => fileExtensionRegExp.test(filename);

const observer = new MutationObserver(([{addedNodes}]) => {
    for (const node of addedNodes) {
        const element = node as Element;
        if (element.tagName === 'DIV') {
            if (element.className === 'js-diff-progressive-container') {
                observer.observe(element, childList);
            } else {
                setRichDiff(element);
            }
        }
    }
});

function setRichDiff(node: Element) {
    for (const fileHeader of select.all('.file-header', node)) {
        if (checkFileIsRichDiffable(select('.file-info > a', fileHeader).title)) {
            select('[aria-label="Display the rich diff"]', fileHeader).click();
        }
    }
}

function init() {
    setRichDiff(select('.js-diff-progressive-container:first-child'));
    observer.observe(select('.js-diff-progressive-container:last-child'), childList);
}

features.add({
    id: 'default-to-rich-diff',
    include: [
        features.isCommit,
        features.isPRFiles
    ],
    load: features.onAjaxedPages,
    init
})