import select from 'select-dom';
import observeEl from '../libs/simplified-element-observer';

const removeZenhubRepoSwitcher = () => {
	const zenhubRepoSwitcher = select('.repohead .zh-repo-switcher');
	if (zenhubRepoSwitcher) {
		zenhubRepoSwitcher.remove();
	}
};

export default () => {
	const repoHead = select('.repohead');
	observeEl(repoHead, removeZenhubRepoSwitcher, {childList: true, subtree: true});
};
