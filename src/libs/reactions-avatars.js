import debounce from 'debounce-fn';
import select from 'select-dom';
import {h} from 'dom-chef';
import {getUsername, flatZip} from './utils';

const arbitraryAvatarLimit = 39;
const approximateHeaderLength = 3; // Each button header takes about as much as 3 avatars

function getParticipants(container) {
	const currentUser = getUsername();
	return container.getAttribute('aria-label')
		.replace(/ reacted with.*/, '')
		.replace(/,? and /, ', ')
		.replace(/, \d+ more/, '')
		.split(', ')
		.filter(username => username !== currentUser)
		.map(username => ({
			container,
			username
		}));
}

// Concats arrays but does so like a zipper instead of appending them
// [[0, 1, 2], [0, 1]] => [0, 0, 1, 1, 2]
function flatZip(table) {
	const maxColumns = Math.max(...table.map(row => row.length));
	const zipped = [];
	for (let col = 0; col < maxColumns; col++) {
		for (const row of table) {
			if (row[col]) {
				zipped.push(row[col]);
			}
		}
	}
	return zipped;
}

function add() {
	for (const list of select.all(`.has-reactions .comment-reactions-options:not(.rgh-reactions)`)) {
		const avatarLimit = arbitraryAvatarLimit - (list.children.length * approximateHeaderLength);

		const participantByReaction = [].map.call(list.children, getParticipants);
		const flatParticipants = flatZip(participantByReaction).slice(avatarLimit);

		for (const participant of flatParticipants) {
			participant.container.append(
				<a href={`/${participant.username}`}>
					<img src={`/${participant.username}.png`}/>
				</a>
			);
		}

		list.classList.add('rgh-reactions');

		// Overlap reaction avatars when near the avatarLimit
		if (flatParticipants.length > avatarLimit * 0.9) {
			list.classList.add('rgh-reactions-near-limit');
		}
	}
}

// Feature testable on
// https://github.com/babel/babel/pull/3646
export default () => {
	add();
	document.addEventListener('socket:message', debounce(add, {wait: 100}));
};
