import select from 'select-dom';

const Y_KEYCODE = 89;

const handler = ({keyCode, target}) => {
	if (keyCode === Y_KEYCODE && target.nodeName !== 'INPUT') {
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
