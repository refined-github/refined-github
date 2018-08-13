import select from 'select-dom';

export default function () {
	const readmeContainer = select('.repository-content #readme');

	if (readmeContainer && !readmeContainer.classList.contains('blob')) {
		readmeContainer.classList.add('rgh-hide-readme-header');
	}
}
