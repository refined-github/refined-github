import OptionsSync from 'webext-options-sync';
import {getUsername, observeEl} from '../libs/utils';

const options = new OptionsSync();

// Hide other users starring/forking your repos
export default async function () {
	const {hideStarsOwnRepos} = await options.getAll();

	if (hideStarsOwnRepos) {
		const username = getUsername();
		observeEl('#dashboard .news', () => {
			$('#dashboard .news .watch_started, #dashboard .news .fork')
				.has(`a[href^="/${username}"]`)
				.css('display', 'none');
		});
	}
}

