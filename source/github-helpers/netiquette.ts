import toMilliseconds from '@sindresorhus/to-milliseconds';
import * as pageDetect from 'github-url-detection';
import {assertDefined} from 'ts-extras';

import api from './api.js';
import {getConversationNumber} from './index.js';

const threeMonths = toMilliseconds({days: 90});

export async function getCloseDate(): Promise<Date | undefined> {
	if (pageDetect.isOpenConversation()) {
		return;
	}

	const {closed_at: closedAt} = await api.v3(`issues/${getConversationNumber()!}`);
	assertDefined(closedAt, 'closed_at field is null');

	return new Date(closedAt);
}

export function wasLongAgo(date: Date): boolean {
	return (Date.now() - date.getTime()) > threeMonths;
}
