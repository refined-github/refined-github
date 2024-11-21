<svelte:options
	customElement={{
		tag: 'storage-usage',
		props: {
			area: {type: 'String', attribute: 'area'},
			item: {type: 'String', attribute: 'item'},
		},
	}}
/>

<!-- prettier-ignore -->
<script lang="ts">
	import prettyBytes from 'pretty-bytes';

	import {onMount} from 'svelte';

	import {getStorageBytesInUse, getStoredItemSize, getTrueSizeOfObject} from '../helpers/used-storage.js';

	const {area, item}: {
		area: 'sync' | 'local';
		item?: string;
	} = $props();
	const storage = chrome.storage[area];

	let used = $state(0);
	const available = $derived((item ? (storage as chrome.storage.SyncStorageArea).QUOTA_BYTES_PER_ITEM ?? storage.QUOTA_BYTES : storage.QUOTA_BYTES) - used);

	async function getStorageUsage() {
		used = item ? await getStoredItemSize(area, item) : await getStorageBytesInUse(area);
	}

	const handleStorageChange = (changes: {[key: string]: chrome.storage.StorageChange}, areaName: chrome.storage.AreaName) => {
		if (item && changes[item]) {
			used = getTrueSizeOfObject(changes[item].newValue);
		}

		if (areaName === area) {
			getStorageUsage();
		}
	};

	$effect(() => {
		if (item) {
			used = getTrueSizeOfObject(storage.get(item));
		}
	});

	onMount(() => {
		getStorageUsage();

		chrome.storage.onChanged.addListener(handleStorageChange);

		return () => {
			chrome.storage.onChanged.removeListener(handleStorageChange);
		};
	});
</script>

<output>
	{available < 100_000
		? `Only ${prettyBytes(available)} available`
		: `${prettyBytes(used)} used`}
</output>
