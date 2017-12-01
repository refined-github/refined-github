import {h} from 'dom-chef';
import select from 'select-dom';
import delegate from '../libs/smart-delegate';
import {isNotifications} from '../libs/page-detect';

function openNotifications() {
	const urls = select.all('.js-notification-target').map(el => el.href);
	browser.runtime.sendMessage({
		urls,
		action: 'openAllInTabs'
	});
	for (const listItem of select.all('.list-group .list-group-item')) {
		listItem.classList.add('read');
	}
}

export default function () {
	if (!isNotifications()) {
		return;
	}
	const unreadCount = select.all('.js-notification-target').length;

	if (unreadCount === 0) {
		return;
	}

	const openButton = <a href="#open_all_in_tabs" class="btn btn-sm BtnGroup-item">Open all in tabs</a>;

	// Make a button group
	const markAsReadButton = select('[href="#mark_as_read_confirm_box"]');
	markAsReadButton.parentNode.classList.add('BtnGroup');
	markAsReadButton.classList.add('BtnGroup-item');
	markAsReadButton.before(openButton);

	// Move out the extra node that messes with .BtnGroup-item:last-child
	document.body.append(select('#mark_as_read_confirm_box'));

	if (unreadCount < 10) {
		openButton.addEventListener('click', openNotifications);
	} else {
		// Add confirmation modal
		openButton.setAttribute('rel', 'facebox');
		document.body.append(
			<div id="open_all_in_tabs" style={{display: 'none'}}>
				<h2 class="facebox-header" data-facebox-id="facebox-header">Are you sure?</h2>

				<p data-facebox-id="facebox-description">Are you sure you want to open {unreadCount} tabs?</p>

				<div class="full-button">
					<button class="btn btn-block" id="open-all-notifications">Open all notifications</button>
				</div>
			</div>
		);

		delegate('#open-all-notifications', 'click', () => {
			openNotifications();
			select('.js-facebox-close').click(); // Close modal
		});
	}
}
