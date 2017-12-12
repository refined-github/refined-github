import select from 'select-dom';
import OptionsSync from 'webext-options-sync';
import {getUsername, observeEl} from '../libs/utils';

const options = new OptionsSync();

// Hide other users starring/forking your repos
export default async function () {
	const {hideStarsOwnRepos} = await options.getAll();

	if (hideStarsOwnRepos) {
		const username = getUsername();
		observeEl('#dashboard .news', () => {
			for (const item of select.all('#dashboard .news .watch_started, #dashboard .news .fork')) {
				if (select(`a[href^="/${username}"]`, item)) {
					item.style.display = 'none';
				}
			}
		});
	}
}
