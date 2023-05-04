import './highlight-todo-comments.css';

import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

const todoRegex = new RegExp("^\/\/\\s*TODO", "gi");
const todoCommentClass = "rgh-todo-comment";

function init(signal: AbortSignal): void {
    observe("span.pl-c", highlight, { signal });
}

function highlight(comment: HTMLSpanElement): void {
    if (comment.classList.contains(todoCommentClass)) {
        return;
    }

    const content = comment.getAttribute("data-code-text") ?? comment.textContent ?? "";

    if (todoRegex.test(content.trim())) {
        comment.classList.add(todoCommentClass);
    }
}

void features.add(import.meta.url, {
    include: [
        pageDetect.hasCode
    ],
    init,
});