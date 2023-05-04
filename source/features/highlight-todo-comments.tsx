import './highlight-todo-comments.css';
import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

const todoRegex = new RegExp("^\/\/\\s*TODO", "gi");

function init(): void {
    console.log("Init highlight-todo-code")
    for (const comment of select.all("span.pl-c")) {
        if (todoRegex.test(comment.getAttribute("data-code-text")?.trim() ?? "")) {
            comment.classList.add("todo-comment");
        }
    }
}

console.log("highlight-todo-code")

void features.add(import.meta.url, {
    include: [
        pageDetect.hasCode
    ],
    init,
});