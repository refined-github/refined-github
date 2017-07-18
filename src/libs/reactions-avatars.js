import debounce from 'debounce-fn';
import select from 'select-dom';
import {h} from 'dom-chef';
import {emptyElement, getUsername} from './utils';

function add() {
	const currentUser = getUsername();
	for (const element of select.all(`
		.comment-reactions.has-reactions
		.comment-reactions-options
		.reaction-summary-item[aria-label]:not(.rgh-reactions)
	`)) {
		element.classList.add('rgh-reactions');
		const participantCount = Number(element.innerHTML.split('/g-emoji>')[1]);
		const participants = element.getAttribute('aria-label')
			.replace(/ reacted with.*/, '')
			.replace(/,? and /, ', ')
			.replace(/, \d+ more/, '')
			.split(', ');
		const userPosition = participants.indexOf(currentUser);

		// If the user is the only participant, leave as is
		if (participantCount === 1 && userPosition > -1) {
			return;
		}

		// Add participant container
		console.log(element.querySelector('div.participants-container'))
		if (!element.querySelector('div.participants-container')) {
			element.append(<div class="participants-container"></div>);
		}

		// Remove self from participant list so you don't see your own avatar
		if (userPosition > -1) {
			participants.splice(userPosition, 1);
		}

		const firstThreeParticipants = participants.slice(0, 3);
		const participantsContainer = element.querySelector('.participants-container');

		// Clear any existing avatars and remainder count
		emptyElement(participantsContainer);

		for (const participant of firstThreeParticipants) {
			participantsContainer.append(
				<a href={`/${participant}`}>
					<img src={`/${participant}.png`}/>
				</a>
			);
		}
	}
}

export default () => {
	add();
	document.addEventListener('socket:message', debounce(add, {wait: 100}));
};
