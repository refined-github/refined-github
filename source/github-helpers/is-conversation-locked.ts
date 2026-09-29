import memoize from 'memoize';

import api from './api.js';
import {getConversationNumber} from './index.js';
import GetIssueLockStatus from './is-conversation-locked.gql';

const isLocked = memoize(async (number: number): Promise<boolean> => {
	const {repository} = await api.v4uncached(GetIssueLockStatus, {
		variables: {
			number,
		},
	});

	return repository.issueOrPullRequest.locked;
}, {
	maxAge: 10_000,
});

export default async function isConversationLocked(conversationNumber = getConversationNumber()!): Promise<boolean> {
	return isLocked(conversationNumber);
}
