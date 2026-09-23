<script lang="ts">
	import cx from 'clsx';
	import EyeIcon from 'octicons-plain-react/Eye';

	import DomChef from '../components/dom-chef.svelte';
	import {buildRepoUrl} from '../github-helpers/index.js';
	import {fetchDomUncached} from '../helpers/fetch-dom.js';

	type Props = {
		onSubscribe: (_repositoryId: string) => Promise<void>;
	};

	const {onSubscribe}: Props = $props();

	let id = $state<string>();
	let subscribed = $state(false);
	let loading = $state(false);

	$effect(() => {
		loadSubscription();
	});

	async function loadSubscription(): Promise<void> {
		const script = await fetchDomUncached(
			buildRepoUrl(''),
			'script[data-target="react-app.embeddedData"]',
		);
		const {payload} = JSON.parse(script!.textContent!);

		const {watchData} = payload.sidebarAbout.watch;
		const {subscribableThreadTypes, repositoryId} = watchData;
		const release = subscribableThreadTypes.find(
			(type: {name: string}) => type.name === 'Release',
		);

		id = repositoryId;
		subscribed = watchData.subscriptionType === 'watching'
			|| Boolean(release?.subscribed);
	}

	async function handleClick(): Promise<void> {
		if (loading || subscribed || !id) {
			return;
		}

		loading = true;

		try {
			await onSubscribe(id);
			subscribed = true;
		} finally {
			loading = false;
		}
	}
</script>

<button
	type="button"
	class={cx(
		'btn px-2 tmp-px-2 mr-2 mb-2 rgh-subscribe-release',
		subscribed && 'tooltipped tooltipped-s',
	)}
	disabled={!id || loading || subscribed}
	onclick={handleClick}
	aria-label={subscribed
	? 'You can change your subscription from the repository home'
	: undefined}
>
	<DomChef as={EyeIcon} />
	<span class="ml-1 tmp-ml-1">
		{subscribed ? 'Subscribed' : 'Subscribe'}
	</span>
</button>
