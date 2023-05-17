import './clean-rich-text-editor.css';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import select from 'select-dom';

function hideToolTip(): void {
    for (const textarea of select.all(`
        input[id="issue_title"], 
        textarea[id="issue_form_repro"], 
        textarea[id="issue_form_description"], 
        input[id="issue_form_browser", 
        textarea[id="new_comment_field"]
    `)) {
        textarea.title = '';
    }
}

void features.addCssFeature(import.meta.url, [pageDetect.hasRichTextEditor]);

void features.add(import.meta.url, {
    include: [
        pageDetect.hasRichTextEditor,
    ],
    init: hideToolTip
})