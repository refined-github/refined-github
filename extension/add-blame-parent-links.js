'use strict';

window.addBlameParentLinks = (() => {
	const getFirstAndLastAffectedLineOfBlame = $commitLink => {
		const $lines = $commitLink.parent().parent().nextUntil('.blame-commit');
		const $firstAndLast = [];
		$firstAndLast.push($lines.eq(0));
		if ($lines.length > 1) {
			$firstAndLast.push($lines.eq($lines.length - 1));
		}

		return $firstAndLast;
	};

	const parseAffectedLines = $commitLink => {
		return getFirstAndLastAffectedLineOfBlame($commitLink)
			.map(item => item.children().eq(1).attr('id').replace(/^L(\d+)$/, '$1'))
			.reduce((prev, cur, i) => [prev, cur].join(i === 0 ? '' : '-'), 'L');
	};

	return () => {
		$('.blame-sha:not(.js-blame-parent)').each((index, commitLink) => {
			const $commitLink = $(commitLink);

			const $blameMetaContainer = $commitLink.nextAll('.blame-commit-meta');
			if ($blameMetaContainer.find('.js-blame-parent').length > 0) {
				return;
			}

			const blameTargets = parseAffectedLines($commitLink);
			const $blameParentLink = $commitLink.clone();
			const commitSha = /\w{40}$/.exec(commitLink.href)[0];
			const href = location.pathname.replace(
				/(\/blame\/)[^/]+/,
				`$1${commitSha}`
			);

			$blameParentLink
				.text('Blame ^')
				.addClass('js-blame-parent')
				.prop('href', `${href}#${blameTargets}`);

			$blameMetaContainer.append($blameParentLink);
		});
	};
})();
