let addReactionContainer;
let reactionButton;
let reactionPopover;
let deactivateInterval;
let isHovering = false;

const showReactionsMenu = { // eslint-disable-line
	init() {
		// set the properties related to DOM elements
		addReactionContainer = $('.reaction-popover-container');
		reactionButton = $(addReactionContainer).find('button.timeline-comment-action, button.add-reaction-btn');
		reactionPopover = $(addReactionContainer).find('.add-reaction-popover');

		// apply the event listeners
		this.mouseEnter();
		this.mouseLeave();
	},
	activatePopover(event) {
		clearInterval(deactivateInterval);
		deactivateInterval = null;
		isHovering = true;

		if ($(event.target).closest('.js-reaction-popover-container').hasClass('active')) {
			return;
		}
		$(event.target).closest('.js-reaction-popover-container').addClass('active');
	},
	setDeactivateTimer(event) {
		isHovering = false;

		if (deactivateInterval) {
			return;
		}
		deactivateInterval = setInterval(() => {
			clearInterval(deactivateInterval);
			deactivateInterval = null;

			if (isHovering) {
				return;
			}

			$(event.target).closest('.js-reaction-popover-container').removeClass('active');
		}, 1500);
	},
	mouseEnter() {
		reactionButton.on('mouseenter', this.activatePopover);
		reactionPopover.on('mouseenter', this.activatePopover);
	},
	mouseLeave() {
		reactionButton.on('mouseleave', this.setDeactivateTimer);
		reactionPopover.on('mouseleave', this.setDeactivateTimer);
	}
};
