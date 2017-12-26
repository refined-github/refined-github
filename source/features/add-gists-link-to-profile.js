import {h} from 'dom-chef';
import select from 'select-dom';
import {getCleanPathname, isEnterprise} from '../libs/page-detect';
import api from '../libs/api';

export default async () => {
	const username = getCleanPathname();
	const href = isEnterprise() ? `/gist/${username}` : `https://gist.github.com/${username}`;

	if (select.exists('.usernav-gists')) {
		return;
	}

	const isIndividualUserProfile = select.exists('body.page-profile');
	const isOrganisationProfile = select.exists('body.org');

	if (isIndividualUserProfile) {
		select('.UnderlineNav-body').append(
			<a href={href} class="UnderlineNav-item usernav-gists" role="tab" title="Gists">
				{'Gists '}
			</a>
		);
	} else if (isOrganisationProfile) {
		select('.orgnav').append(
			<a href={href} class="pagehead-tabs-item usernav-gists">
				{'Gists '}
			</a>
		);
	} else {
		return;
	}

	if (select.exists('.usernav-gists-count')) {
		return;
	}

	const {public_gists: publicGists} = await api(`users/${username}`);

	select('.usernav-gists').appendChild(
		<span class="Counter usernav-gists-count">{publicGists}</span>
	);
};
