import select from 'select-dom';

const activeClassName = 'refined-github-diff-expand';

function attachClickHandler(expander) {
	const button = select('.js-expand', expander);
	expander.classList.add(activeClassName);
	expander.addEventListener('click', e => {
		e.preventDefault();
		button.click();
	}, { once: true });
}

export default () => {
	console.log('diff-expand');
	select.all(`.js-expandable-line:not(.${activeClassName})`)
	.forEach(attachClickHandler);
};
