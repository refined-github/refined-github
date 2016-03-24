window.diffFileHeader = (() => {
	const diffFile = (() => {
		let lastFile;

		const hasChanged = nextFile => {
			if (nextFile !== lastFile) {
				lastFile = nextFile;
				return true;
			}

			return false;
		};

		const reset = () => {
			lastFile = '';
		};

		return {
			hasChanged,
			reset
		};
	})();

	const getDiffToolbarHeight = () => {
		const el = $('.pr-toolbar.is-stuck').get(0);
		return (el && el.clientHeight) || 0;
	};

	const isFilePartlyVisible = (fileEl, offset) => {
		const {bottom} = fileEl.getBoundingClientRect();
		return bottom >= offset;
	};

	const getHighestVisibleDiffFilename = () => {
		const toolbarHeight = getDiffToolbarHeight();
		if (!toolbarHeight) {
			return;
		}

		// Note: Not using $.each, because Sprint doesn't allow bailing out early
		const files = $('.file.js-details-container').dom;
		return files.find(el => isFilePartlyVisible(el, toolbarHeight));
	};

	const diffHeaderFilename = () => {
		const targetDiffFile = getHighestVisibleDiffFilename();
		if (!targetDiffFile) {
			return;
		}

		const filename = $(targetDiffFile).find('.file-header').attr('data-path');

		if (!diffFile.hasChanged(filename)) {
			return;
		}

		$('.diff-toolbar-filename').text(filename);
	};

	const setup = () => {
		const events = ['scroll', 'resize'];
		events.forEach(event => window.addEventListener(event, diffHeaderFilename));
		$(`<span class="diff-toolbar-filename"></span>`)
				.insertAfter($('.toc-select'));
		diffFile.reset();
	};

	const destroy = () => {
		const events = ['scroll', 'resize'];
		events.forEach(event => window.removeEventListener(event, diffHeaderFilename));
		$('.diff-toolbar-filename').remove();
	};

	return {
		setup,
		destroy
	};
})();
