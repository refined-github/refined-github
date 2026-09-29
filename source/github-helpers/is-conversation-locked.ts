import memoize from 'memoize';

import api from './api.js';
import {getConversationNumber} from './index.js';
import GetIssueLockStatus from './is-conversation-locked.gql';

const isConversationLocked = memoize(async (number: number): Promise<boolean> => {
	const {repository} = await api.v4uncached(GetIssueLockStatus, {
		variables: {
			number,
		},
	});

	return repository.issueOrPullRequest.locked;
}, {
	maxAge: 10_000,
});

export default async function isConversionLocked(conversationNumber = getConversationNumber()!): Promise<boolean> {
	return isConversationLocked(conversationNumber);
}
