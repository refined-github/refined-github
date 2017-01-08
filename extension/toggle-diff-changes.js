'use strict';

window.toggleDiffChanges = (() => {
	const init = () => {
		if ($('.js-collapse-all').length > 0) {
			return;
		}

		const html = `<button type="button" class="btn btn-sm js-collapse-all">Collapse All</button>`;
		const $btn = $(html).appendTo('.gh-header-actions');

		let allCollapsed = false;
		$btn.click(() => {
			$('.file-header').click();
			if (allCollapsed) {
				$btn.text('Collapse All');
			} else {
				$btn.text('Expand All');
			}

			allCollapsed = !allCollapsed;
		});
	};

	return {init};
})();
