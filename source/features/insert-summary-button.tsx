import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import * as icons from '../libs/icons';

const init = () => {
  const addSummaryDetails = () => {
    const commentField = select<HTMLTextAreaElement>('.js-comment-field');

    if (!commentField) {
      return false;
    }
  
    const summaryContent = `${
      <details>
        <summary>Header</summary>
        This content won't be seen unless the details are expanded.
        Replace with your content.
      </details>
    }`;

    const pos = commentField.selectionStart;
    const currentVal = commentField.value;
    const before = currentVal.substring(0, pos);
    const after = currentVal.substring(pos);

    commentField.value = `${before}${summaryContent}${after}`;
  }

  const toolbarGroup = select('.toolbar-group');
  if (!toolbarGroup) {
    return false;
  }

  toolbarGroup.appendChild(
    <md-italic
      tabindex="-1"
      class="js-summary-button toolbar-item tooltipped tooltipped-n"
      aria-label="Add summary"
      role="button">
        {icons.info()}
      </md-italic>
  )

  const summaryToolbarBtn = select('.js-summary-button');
  summaryToolbarBtn.addEventListener('click', addSummaryDetails);
};

features.add({
  id: 'insert-summary-button',
  include: [
		features.isPR,
		features.isIssue,
		features.isNewIssue,
		features.isCompare,
		features.isCommit
	],
	load: features.onAjaxedPages,
	init
});
