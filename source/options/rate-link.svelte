<svelte:options
	customElement={{
		tag: 'rate-link',
	}}
/>

<script lang="ts">
	import {isChrome, isFirefox} from 'webext-detect';

	const CHROME_URL =
		'https://chrome.google.com/webstore/detail/refined-github/hlepfoohegkhhmjieoechaddaejaokhf/reviews';
	const FIREFOX_URL = 'https://addons.mozilla.org/firefox/addon/refined-github-';
	const SAFARI_URL =
		'https://apps.apple.com/app/id1519867270?action=write-review';

	const href = isFirefox() ? FIREFOX_URL : isChrome() ? CHROME_URL : SAFARI_URL;
</script>

<a {href}><slot /></a>
