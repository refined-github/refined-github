/* globals pageDetect */

window.prStatus = (() => {
	const getPRIDs = () => Array.from($('.js-issues-list-check')).map(el => el.value);

	const fetchDOMForPRs = ids => {
		const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
		return Promise.all(ids.map(id => {
			const uri = `/${ownerName}/${repoName}/pull/${id}`;
			const fetchOpts = {credentials: 'include'};
			return fetch(uri, fetchOpts).then(res => res.text()).then(markup => ({
				id,
				markup
			}));
		}));
	};

	const getStatusFromMarkupString = markup => {
		const $dom = $(new DOMParser().parseFromString(markup, 'text/html'));
		const $statusDivs = $dom.find('a:contains("See review")').closest('.merge-status-item');

		return Array.from($statusDivs).map(div => {
			const user = $(div).find('.text-emphasized').text().trim();
			const isApproved = div.innerText.includes('approved these changes');
			return { user, isApproved };
		});
	};

	const setup = () => {
		fetchDOMForPRs(getPRIDs()).then(prs => {
			const resultsByPR = prs.reduce((acc, {id, markup}) => {
				const results = getStatusFromMarkupString(markup);
				return results.length ? acc.set(id, results) : acc;
			}, new Map());
			console.log(resultsByPR);
		});
	};

	return {setup};
})();
