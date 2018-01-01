import select from 'select-dom';

const activeClassName = 'refined-github-diff-expand';

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
	select.all('.diff-table')
	.forEach(attachClickHandler);
};
