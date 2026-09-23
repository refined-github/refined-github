<script lang="ts">
	import BellIcon from 'octicons-plain-react/Bell';

	import api from '../github-helpers/api.js';
	import DomChef from './dom-chef.svelte';
	import SubscribeRelease from './subscribe-release.gql';

	type ViewerSubscription = 'IGNORED' | 'SUBSCRIBED' | 'UNSUBSCRIBED' | null;

	type Props = {
		onSubscribe: (_repositoryId: string) => Promise<void>;
	};

	const {onSubscribe}: Props = $props();

	let id = $state<string>();
	let viewerSubscription = $state<ViewerSubscription>();
	let loading = $state(false);

	$effect(() => {
		loadSubscription();
	});

	async function loadSubscription(): Promise<void> {
		const {repository} = await api.v4(SubscribeRelease);

		id = repository.id;
		viewerSubscription = repository.viewerSubscription;
	}

	const subscribed = $derived(
		viewerSubscription === null || viewerSubscription === 'SUBSCRIBED',
	);

	async function handleClick(): Promise<void> {
		if (loading || subscribed || !id) {
			return;
		}

		loading = true;

		try {
			await onSubscribe(id);
			viewerSubscription = 'SUBSCRIBED';
		} finally {
			loading = false;
		}
	}
</script>

<button
	type="button"
	class="btn px-2 tmp-px-2 tooltipped tooltipped-se rgh-subscribe-release"
	disabled={!id || loading || subscribed}
	aria-label={subscribed
	? 'You can change your subscription from the repository home'
	: 'Subscribe'}
	onclick={handleClick}
>
	<DomChef as={BellIcon} />
	<span class="ml-1 tmp-ml-1">
		{subscribed ? 'Subscribed' : 'Subscribe'}
	</span>
</button>
