import select from 'select-dom';
import {h} from 'dom-chef';

function getEventHandler(comment) {
	return () => {
		const body = select('.js-comment-body', comment).innerText.trim();
		const blockquote = body.split('\n').map(line => '> ' + line).join('\n') + '\n\n';
		const newCommentField = select('#new_comment_field');
		newCommentField.value = blockquote;
		newCommentField.focus();
	};
}

export default () => {
	select.all('.comment').forEach(comment => {
		const replyAction = (
			<button type="button" class="timeline-comment-action btn-link tooltipped tooltipped-nw" aria-label="Reply" onClick={getEventHandler(comment)}>
				<svg width="16" height="16" class="octicon octicon-reply" viewBox="0 0 16 16" version="1.1" aria-hidden="true">
					<path fill-rule="evenodd" d="M6 3.5c3.92.44 8 3.125 8 10-2.312-5.062-4.75-6-8-6V11L.5 5.5 6 0v3.5z"></path>
				</svg>
			</button>
		);

		const commentActions = select('.timeline-comment-actions', comment);

		if (commentActions) {
			commentActions.insertBefore(replyAction, commentActions.firstChild);
		}
	});
};
