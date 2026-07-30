<script>
	import cx from 'classnames';
	import * as pageDetect from 'github-url-detection';
</script>
<div
	class={cx(
		'mt-3 tmp-mt-3',
		// TODO: Drop after the legacy PR conversation is gone
		// https://github.com/refined-github/refined-github/pull/9901
		pageDetect.isPRConversation()
			&& 'ml-0 tmp-ml-0 pl-0 tmp-pl-0 ml-md-6 tmp-ml-md-6 pl-md-3 tmp-pl-md-3 mt-3 tmp-mt-3',
	)}
>
	<slot></slot>
</div>
