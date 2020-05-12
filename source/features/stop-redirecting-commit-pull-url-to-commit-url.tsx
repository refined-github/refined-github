import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../libs/features';

function init(): void {
    for (const form of select.all(['form#new_issue', 'form.js-new-comment-form'])) {
        form.addEventListener('submit', () => {
            for (const textarea of select.all('textarea', form)) {
                if (textarea.value) {
                    textarea.value = textarea.value.replace(/\bhttps?:\/\/github.com\/.*\/pull\/.*\b/gi, (match): string => {
                        try {
                            if (match) {
                                const parts = match.split('/') || [];
                                if (parts && parts.length) {
                                    const sha = parts[parts.length - 1].substring(0, 7);
                                    return `[${sha}](${match})`;
                                }
                            }
                        } catch (error) {
                            console.log(error);
                            return match;
                        }

                        return match;
                    })
                }
            }
        });
    }
}

features.add({
    id: __filebasename,
    description: 'Prevents Github from converting PR links into commit links',
    screenshot: false
}, {
    include: [
        pageDetect.isIssue,
        pageDetect.isPRConversation
    ],
    init
});
