export interface Notification {
	participants: Array<{
		username: string | null;
		avatar: string;
	}>;
	state: unknown; // Is this just 'read' | 'unread' or something like that?
	isParticipating: boolean;
	repository: string;
	dateTitle: string;
	title: string;
	type: 'pull-request' | 'issue';
	date: Date;
	url: string;
}
