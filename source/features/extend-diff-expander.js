import select from 'select-dom';

function attachClickHandler(diff) {
	diff.classList.add('refined-github-diff-expand');
	diff.addEventListener('click', e => {
		if (e.target.parentElement.classList.contains('js-expandable-line')) {
			e.preventDefault();
			select('.js-expand', e.target.parentElement).click();
		}
	});
}

export default () => {
	const diffView = select('.diff-view');

	if (diffView) {
		attachClickHandler(diffView);
	}
};
