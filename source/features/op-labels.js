import {h} from 'dom-chef';
import select from 'select-dom';
import {getUsername} from '../libs/utils';
import * as pageDetect from '../libs/page-detect';
import onNewComments from '../libs/on-new-comments';

function addLabels() {
	let op;
	if (pageDetect.isPR()) {
		const titleRegex = /^(?:.+) by (\S+) · Pull Request #(\d+)/;
		[, op] = titleRegex.exec(document.title) || [];
	} else {
		op = select('.timeline-comment-header-text .author').textContent;
	}

	let newComments = select.all('.js-comment:not(.refined-github-op)')
		.filter(el => select(`strong .author[href="/${op}"]`, el));

	if (!pageDetect.isPRFiles()) {
		newComments = newComments.slice(1);
	}

	if (newComments.length === 0) {
		return;
	}

	const type = pageDetect.isPR() ? 'pull request' : 'issue';
	const tooltip = `${op === getUsername() ? 'You' : 'This user'} submitted this ${type}.`;

	const placeholders = select.all(`
		.timeline-comment .timeline-comment-header-text,
		.review-comment .comment-body
	`, newComments);

	for (const placeholder of placeholders) {
		placeholder.before(
			<span class="timeline-comment-label tooltipped tooltipped-multiline tooltipped-s" aria-label={tooltip}>
				Original&nbsp;Poster
			</span>
		);
	}

	for (const el of newComments) {
		el.classList.add('refined-github-op');
	}
}

export default function () {
	addLabels();
	onNewComments(addLabels);
}
