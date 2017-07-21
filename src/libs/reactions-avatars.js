import debounce from 'debounce-fn';
import select from 'select-dom';
import {h} from 'dom-chef';
import {getUsername} from './utils';

function add() {
	const currentUser = getUsername();
	for (const element of select.all(`
		.comment-reactions.has-reactions
		.comment-reactions-options
		.reaction-summary-item[aria-label]:not(.rgh-reactions)
	`)) {
		element.classList.add('rgh-reactions');
		const participants = element.getAttribute('aria-label')
			.replace(/ reacted with.*/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ')
			.filter(username => username !== currentUser)
			.filter((u, i) => i < 3) // Limit to 3 avatars
			.map(user => (
				<a href={`/${user}`}>
					<img src={`/${user}.png`}/>
				</a>
			));

		element.append(...participants);
	}
}

export default () => {
	add();
	document.addEventListener('socket:message', debounce(add, {wait: 100}));
};
