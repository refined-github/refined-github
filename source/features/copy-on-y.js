import select from 'select-dom';

const handler = ({key, target}) => {
	if (key === 'y' && target.nodeName !== 'INPUT') {
		select('#js-copy-permalink').click();
	}
};

const setup = () => {
	window.addEventListener('keyup', handler);
};

const destroy = () => {
	window.removeEventListener('keyup', handler);
};

export default {
	setup,
	destroy
};
