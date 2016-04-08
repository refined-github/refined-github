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

	const maxPixelsAvailable = () => {
		// Unfortunately can't cache this value, as it'll change with the browsers zoom level
		const filenameLeftOffset = $('.diff-toolbar-filename').get(0).getBoundingClientRect().left;
		const diffStatLeftOffset = $('.diff-toolbar-filename + .right').get(0).getBoundingClientRect().left;

		return diffStatLeftOffset - filenameLeftOffset;
	};

	const parseFileDetails = filename => {
		const folderCount = (filename.match(/\//g) || []).length;
		const [, basename] = (filename.match(/(?:\/)([\w\.-]+)$/) || []);
		const [, topDir] = (filename.match(/^([\w\.-]+)\//) || []);

		return {
			folderCount,
			basename,
			topDir
		};
	};

	const updateFileLabel = val => {
		const target = $('.diff-toolbar-filename').get(0);
		target.classList.add('filename-width-check');
		target.textContent = val;

		const maxPixels = maxPixelsAvailable();
		const doesOverflow = () => target.getBoundingClientRect().width > maxPixels;
		const {basename, topDir, folderCount} = parseFileDetails(val);

		if (doesOverflow() && folderCount > 1) {
			target.textContent = `${topDir}/.../${basename}`;
		}

		if (doesOverflow()) {
			target.textContent = basename;
		}

		target.classList.remove('filename-width-check');
	};

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

	const diffHeaderFilename = isResize => {
		const targetDiffFile = getHighestVisibleDiffFilename();
		if (!targetDiffFile) {
			return;
		}

		const filename = $(targetDiffFile).find('.file-header').attr('data-path');

		if (!diffFile.hasChanged(filename) && !isResize) {
			return;
		}

		if (isResize) {
			const target = $('.diff-toolbar-filename').get(0);
			if (target.getBoundingClientRect().width < maxPixelsAvailable()) {
				return;
			}
		}

		updateFileLabel(filename);
	};

	const setup = () => {
		$(window).on('scroll.diffheader', () => diffHeaderFilename());
		$(window).on('resize', () => diffHeaderFilename(true));

		$(`<span class="diff-toolbar-filename"></span>`)
				.insertAfter($('.toc-select'));
		diffFile.reset();
	};

	const destroy = () => {
		$(window).off('scroll.diffheader');
		$(window).off('resize.diffheader');
		$('.diff-toolbar-filename').remove();
	};

	return {
		setup,
		destroy
	};
})();
