import select from 'select-dom';
import domify from '../libs/domify';
import {getRepoURL} from '../libs/page-detect';

export default async function () {
	const html = await fetch(`${location.origin}/${getRepoURL()}/commits/`).then(r => r.text());
	const status = select('.commit-build-statuses', domify(html));
	if (status) {
		select('.pagehead [itemprop="name"]').append(status);
	}
}
