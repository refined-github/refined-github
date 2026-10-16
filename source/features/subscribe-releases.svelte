<script lang="ts">
	import EyeIcon from 'octicons-plain-react/Eye';

	import DomChef from '../components/dom-chef.svelte';
	import {fetchDomUncached} from '../helpers/fetch-dom.js';

	type Props = {
		repositoryId: string;
		onSubscribe: (_repositoryId: string, _threadTypes: string[]) => Promise<void>;
	};

	const {repositoryId, onSubscribe}: Props = $props();

	let threadTypes = $state<string[]>();
	let subscribed = $state(false);
	let loading = $state(false);

	$effect(() => {
		loadSubscription();
	});

	async function loadSubscription(): Promise<void> {
		const script = await fetchDomUncached(
			`/notifications/${repositoryId}/watch_subscription`,
			'script[data-target="react-partial.embeddedData"]',
		);
		const {props} = JSON.parse(script!.textContent);

		threadTypes =
			(props.subscribableThreadTypes as Array<{name: string; subscribed: boolean}>)
				.filter(type => type.subscribed)
				.map(type => type.name);

		subscribed = props.subscriptionType === 'watching'
			|| threadTypes.includes('Release');
	}

	async function handleClick(): Promise<void> {
		if (loading || subscribed || !threadTypes) {
			return;
		}

		loading = true;

		try {
			await onSubscribe(repositoryId, threadTypes);
			subscribed = true;
		} finally {
			loading = false;
		}
	}
</script>

<button
	type="button"
	class="btn px-2 tmp-px-2 mr-2 tmp-mr-2 mb-2 tmp-mb-2 tooltipped tooltipped-s"
	disabled={!threadTypes || loading || subscribed}
	onclick={handleClick}
	aria-label={subscribed
	? 'You can change your subscription from the repository home'
	: 'Subscribe to releases'}
>
	<DomChef as={EyeIcon} />
	<span class="ml-1 tmp-ml-1">
		{subscribed ? 'Subscribed' : 'Subscribe'}
	</span>
</button>
