import {h} from 'dom-chef';
import select from 'select-dom';
import {safeElementReady} from '../libs/utils';

export default async function () {
	// `isUserProfile` returns `true` on organization pages too,
	// but they already have scoped search
	if (select.exists('body.org')) {
		return;
	}

	await safeElementReady('.header-search');

	const searchContainer = select('.header-search');
	const searchForm = select('.js-site-search-form', searchContainer);
	const searchScope = select('.header-search-scope', searchForm);
	const searchInput = select('.header-search-input', searchForm);

	searchForm.addEventListener('submit', () => {
		if (select.exists('.scoped-search')) {
			const username = select('.vcard-username').textContent;
			searchForm.append(
				<input type="hidden" value={`user:${username} ${searchInput.value}`} name="q" />
			);
		}
	});

	searchForm.setAttribute('data-scoped-search-url', '/search');

	searchContainer.classList.add('scoped-search', 'site-scoped-search');
	searchInput.classList.add('js-site-search-field', 'is-clearable');

	searchInput.placeholder = 'Search';
	searchScope.textContent = 'This user';
}
