import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from 'delegate';

export default function () {
	for (const view of select.all('.js-comment .js-minimize-comment')) {
		console.log(view);

		if (view.classList.contains('rgh-comment-shortcuts')) {
			continue;
		}

		const form = select('.js-comment-minimize', view);
		const target = select('select', form);
		const btn = select('.btn', form);
		const dom = (
			<div>
				<button class="btn btn-sm rgh-hide-comment" data-value="SPAM">Spam</button>
				<button class="btn btn-sm rgh-hide-comment ml-1" data-value="ABUSE">Abuse</button>
				<button class="btn btn-sm rgh-hide-comment ml-1" data-value="OFF_TOPIC">Off Topic</button>
				<button class="btn btn-sm rgh-hide-comment ml-1" data-value="OUTDATED">Outdated</button>
				<button class="btn btn-sm rgh-hide-comment ml-1" data-value="RESOLVED">Resolved</button>
			</div>
		);

		target.parentElement.insertBefore(dom, target);

		delegate('.rgh-hide-comment', 'click', (event) => {
			target.value = event.target.dataset.value;
			btn.click();
		});

		target.classList.add('d-none');
		btn.classList.add('d-none');

		view.classList.add('rgh-comment-shortcuts');
	}
}
