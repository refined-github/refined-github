import api from '../github-helpers/api.js';
import {openTabsFromBackground} from '../helpers/open-tabs.js';

const limit = 5;

type Notification = {
	id: string;
	subject: {
		title: string;
		url?: string;
		latest_comment_url?: string;
		type: string;
	};
	repository: {
		full_name: string;
	};
};
export type OpenResponse = {
	opened: number;
	remaining: boolean;
};

export default async function openUnreadNotifications(tab: chrome.tabs.Tab): Promise<OpenResponse> {
	// Fetch unread notifications using the REST API
	const response = await api.v3('/notifications');
	const notifications = response as unknown as Notification[];

	const urls = notifications.slice(0, limit).map(notification => getNotificationUrl(notification));

	await openTabsFromBackground(urls, {tab});

	return {
		opened: urls.length,
		remaining: notifications.length > limit,
	};
}

function getNotificationUrl(notification: Notification): string {
	// Get the URL from the subject, or fall back to latest comment
	const apiUrl = notification.subject.url ?? notification.subject.latest_comment_url;
	if (!apiUrl) {
		// Fallback to repository URL if no specific URL available
		return `https://github.com/${notification.repository.full_name}`;
	}

	// Convert API URL to web URL
	// API URLs look like: https://api.github.com/repos/owner/repo/issues/123
	// Web URLs should be: https://github.com/owner/repo/issues/123
	return apiUrl
		.replace('https://api.github.com/repos/', 'https://github.com/')
		.replace('/pulls/', '/pull/'); // Fix PR URLs
}
