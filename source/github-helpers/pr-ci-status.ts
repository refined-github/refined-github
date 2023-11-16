
import api from './api.js';
import {getConversationNumber} from './index.js';
import GetPRChecks from './pr-ci-status.gql';

// https://docs.github.com/en/graphql/reference/enums#statusstate
export type StatusState = false | 'SUCCESS' | 'FAILURE' | 'PENDING' | 'ERROR' | 'EXPECTED';
export type PrState = {head: string; state: StatusState};

export async function getPrState(): Promise<PrState> {
	const pr = getConversationNumber()!;
	const {repository} = await api.v4uncached(GetPRChecks, {variables: {pr}});
	const {target} = repository.pullRequest.headRef;
	return {head: target.oid, state: target.statusCheckRollup?.state ?? false};
}

class PrCiStatus extends EventTarget {
	private timer: NodeJS.Timeout | undefined;
	private lastState: PrState | undefined;
	private lastPoll: Promise<PrState> | undefined;

	startPolling(): void {
		if (this.timer === undefined) {
			this.timer = setTimeout(async () => this.poll(), 2000);
		}
	}

	stopPolling(): void {
		clearTimeout(this.timer);
		this.timer = undefined;
	}

	async getLatestValue(): Promise<PrState> {
		if (this.timer) {
			return this.lastPoll!;
		}

		return getPrState();
	}

	private async fetchData(): Promise<PrState> {
		this.lastPoll = getPrState();
		return this.lastPoll;
	}

	private async poll(): Promise<void> {
		try {
			const newData = await this.fetchData();

			if (!this.lastState || JSON.stringify(newData) !== JSON.stringify(this.lastState)) {
				this.lastState = newData;
				this.triggerChangeCallbacks(newData);
			}
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			this.startPolling();
		}
	}

	private triggerChangeCallbacks(data: PrState): void {
		if (data.head !== this.lastState?.head) {
			this.dispatchEvent(new CustomEvent('head-change', {detail: data.head}));
		}

		if (data.state !== this.lastState?.state) {
			this.dispatchEvent(new CustomEvent('state-change', {detail: data.state}));
		}
	}
}

const prCiStatus = new PrCiStatus();
export default prCiStatus;
