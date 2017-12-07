import copyToClipboard from 'copy-text-to-clipboard';
import select from 'select-dom';

const Y_KEYCODE = 89;

const handler = ({keyCode, target}) => {
	if (keyCode === Y_KEYCODE && target.nodeName !== 'INPUT') {
		const commitIsh = select('.commit-tease-sha').href.split('/').pop();
		const uri = location.href.replace(/\/blob\/[\w-]+\//, `/blob/${commitIsh}/`);

		copyToClipboard(uri);
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
