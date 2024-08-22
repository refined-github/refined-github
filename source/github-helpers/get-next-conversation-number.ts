import api from './api.js';

export async function getNextConversationNumber(): Promise<number> {
	const issues = await api.v3('issues?per_page=1');
	return issues[0].number;
}
