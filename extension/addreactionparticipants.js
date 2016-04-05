const addReactionParticipants = {
	add(currentUser) {
		$('.comment-reactions').each((index, reactionsContainer) => {
			const $reactionsContainer = $(reactionsContainer);
			if (!$reactionsContainer.hasClass('has-reactions')) {
				return;
			}

			const $reactionButtons = $reactionsContainer.find('.comment-reactions-options .reaction-summary-item[aria-label]');

			$reactionButtons.each((index, element) => {
				const reactionEmoji = $(element).html().replace(element.innerHTML.split('/g-emoji>')[1], '');
				const participantCount = Number(element.innerHTML.split('/g-emoji>')[1]);
				const participants = element.getAttribute('aria-label')
					.replace(/,? and /, ', ')
					.replace(/, \d+ more/, '')
					.split(', ');
				const userPosition = participants.indexOf(currentUser);

				// if the user is the only participant, leave as is
				if (participantCount === 1 && userPosition > -1) {
					return;
				}

				// get rid of existing count
				$(element).html(reactionEmoji);

				// add participant container
				if ($(element).find('div.participants-container').length === 0) {
					$(element).append('<div class="participants-container">');
				}

				// remove self from participant list so you don't see your own avatar
				if (userPosition > -1) {
					participants.splice(userPosition, 1);
				}

				const firstThreeParticipants = participants.slice(0, 3);
				const participantsContainer = $(element).find('.participants-container').get(0);
				const remainder = participantCount - firstThreeParticipants.length;

				// clear any existing avatars and remainder count
				$(participantsContainer).html('');

				for (const participant of firstThreeParticipants) {
					$(participantsContainer).append(`<img src="https://github.com/${participant}.png">`);
				}

				if (remainder > 0) {
					$(participantsContainer).append(`<span>+${remainder}</span>`);
				}
			});
		});
	},

	reapply(event, currentUser) {
		if (!$(event.target).closest('button').not('.add-reaction-btn').is('.add-reactions-options-item, .reaction-summary-item')) {
			return;
		}
		const applyReactions = setInterval(() => {
			addReactionParticipants.add(currentUser);
			clearInterval(applyReactions);
		}, 1000);
	}
};
