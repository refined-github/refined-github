import select from 'select-dom';
import {h} from 'dom-chef';
import {getUsername} from '../libs/utils';
import * as icons from '../libs/icons';

const RESOLVED_TEXT_REGEX = /^Comment resolved by @([a-zA-Z0-9-]+)/;

export default () => {
  for (const comment of select.all('.comment.timeline-comment')) {
    const body = select('.comment-body', comment);
    const isResolved = RESOLVED_TEXT_REGEX.test(body.innerText);

    if (isResolved) {
      const commentContainer = select('.edit-comment-hide', comment);
      commentContainer.style.display = 'none';
      const toggle = (
        <button
          type="button"
          class="btn-link"
          onClick={() => {
            if (commentContainer.style.display === 'none') {
              commentContainer.style.display = '';
              toggle.innerHTML = icons.fold().outerHTML;
            } else {
              commentContainer.style.display = 'none';
              toggle.innerHTML = icons.unfold().outerHTML;
            }
          }}>
          {icons.unfold()}
        </button>
      );
      select('.timeline-comment-actions', comment).prepend(toggle);
    }

    const dropdown = select('.dropdown-menu.show-more-popover', comment);
    const textarea = select('.js-comment-update .comment-form-textarea', comment);
    const submit = select('.js-comment-update button[type="submit"]', comment);

    if (!isResolved && dropdown) {
      let dropdownButton = select(
        '.btn-link.timeline-comment-action',
        dropdown.parentElement
      );
      dropdown.prepend(
        <button
          type="button"
          class="dropdown-item btn-link tooltipped tooltipped-nw"
          aria-label="Resolve comment"
          onClick={() => {
            textarea.value = (
              `Comment resolved by @${getUsername()}\n\n---\n\n` +
              textarea.value
            );
            submit.click();
            dropdownButton.click();
          }}>
          Resolve
        </button>
      );
    }
  }


  // select('.review-comment');
};





<button type="button" class="btn-link text-gray float-right f6 outdated-comment-label show-outdated-button js-details-target tooltipped tooltipped-w" aria-expanded="false" aria-label="Alt + click to expand/collapse all">
  <svg aria-hidden="true" class="octicon octicon-unfold position-relative mr-1" height="16" version="1.1" viewBox="0 0 14 16" width="14"><path fill-rule="evenodd" d="M11.5 7.5L14 10c0 .55-.45 1-1 1H9v-1h3.5l-2-2h-7l-2 2H5v1H1c-.55 0-1-.45-1-1l2.5-2.5L0 5c0-.55.45-1 1-1h4v1H1.5l2 2h7l2-2H9V4h4c.55 0 1 .45 1 1l-2.5 2.5zM6 6h2V3h2L7 0 4 3h2v3zm2 3H6v3H4l3 3 3-3H8V9z"></path></svg>
  Show outdated
</button>
