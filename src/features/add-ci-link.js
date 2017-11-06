import select from 'select-dom';
import domify from '../libs/domify';
import {getRepoURL} from '../libs/page-detect';

export default async function () {
	if (select.exists('.rgh-ci-link')) {
		return;
	}
	const html = await fetch(`${location.origin}/${getRepoURL()}/commits/`).then(r => r.text());
	const status = select('.commit-build-statuses', domify(html));
	if (status) {
		status.classList.add('rgh-ci-link');
		select('.pagehead [itemprop="name"]').append(status);
	}
}
