import select from 'select-dom';
import {h} from 'dom-chef';

export default async () => {
	// Safeguard against accidentally modifying existing scoped search
	// on organization pages because `isUserProfile` returns `true`
	// for organization pages
	if (select.exists('.header-search.scoped-search')) {
		return;
	}

	const searchContainer = select('.header-search');
	const searchForm = select('.js-site-search-form', searchContainer);
	const searchScope = select('.header-search-scope', searchForm);
	const searchInput = select('.header-search-input', searchForm);

	const userName = select('.vcard-username').textContent;

	searchContainer.classList.add('scoped-search');
	searchContainer.classList.add('site-scoped-search');

	searchForm.setAttribute('data-scoped-search-url', '/search');

	const pseudoSearchInput = (
		<input type="hidden" class="js-site-search-type-field" name="q" />
	);
	searchForm.append(pseudoSearchInput);

	searchForm.addEventListener('submit', () => {
		pseudoSearchInput.value = `user:${userName} ${searchInput.value}`;
	});

	searchScope.textContent = 'This user';

	searchInput.classList.add('js-site-search-field');
	searchInput.classList.add('is-clearable');
	searchInput.placeholder = 'Search';
	searchInput.name = '';
};
