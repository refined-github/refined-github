const addReactionParticipants = {
	add(currentUser) {
		$('.comment-reactions.has-reactions').each((index, reactionsContainer) => {
			const $reactionsContainer = $(reactionsContainer);
			const $reactionButtons = $reactionsContainer.find('.comment-reactions-options .reaction-summary-item[aria-label]');

			$reactionButtons.each((index, element) => {
				const $element = $(element);
				const participantCount = Number($element.html().split('/g-emoji>')[1]);
				const participants = $element.attr('aria-label')
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
				if (!element.querySelector('div.participants-container')) {
					$element.append('<div class="participants-container">');
				}

				// Remove self from participant list so you don't see your own avatar
				if (userPosition > -1) {
					participants.splice(userPosition, 1);
				}

				const firstThreeParticipants = participants.slice(0, 3);
				const $participantsContainer = $element.find('.participants-container');

				// Clear any existing avatars and remainder count
				$participantsContainer.html('');

				for (const participant of firstThreeParticipants) {
					$participantsContainer.append(`
						<a href="/${participant}">
							<img src="/${participant}.png">
						</a>
					`);
				}
			});
		});
	},

	reapply(event, currentUser) {
		if ($(event.target).closest('.add-reactions-options-item, .reaction-summary-item').not('.add-reaction-btn').length === 0) {
			return;
		}

		const applyReactions = setInterval(() => {
			addReactionParticipants.add(currentUser);
			clearInterval(applyReactions);
		}, 500);
	},

	addListener(currentUser) {
		$(document).on('click', event => {
			addReactionParticipants.reapply(event, currentUser);
		});
	}
};
