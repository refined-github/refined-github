import copyToClipboard from 'copy-text-to-clipboard';
import select from 'select-dom';

const handler = ({key, target}) => {
	if (key === 'y' && target.nodeName !== 'INPUT') {
		const permalink = select('.js-permalink-shortcut').href;
		copyToClipboard(permalink + location.hash);
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
