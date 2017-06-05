import $ from './vendor/jquery.slim.min';
import {select, debounce} from './util';

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
	const filenameLeftOffset = select('.diff-toolbar-filename').getBoundingClientRect().left;
	const diffStatLeftOffset = select('.diffbar > .diffstat').getBoundingClientRect().left;

	return diffStatLeftOffset - filenameLeftOffset;
};

const parseFileDetails = filename => {
	const folderCount = (filename.match(/\//g) || []).length;
	const [, basename] = (filename.match(/(?:\/)([\w.-]+)$/) || []);
	const [, topDir] = (filename.match(/^([\w.-]+)\//) || []);

	return {
		folderCount,
		basename,
		topDir
	};
};

const updateFileLabel = val => {
	const $target = $('.diff-toolbar-filename');
	$target.addClass('filename-width-check').text(val);

	const maxPixels = maxPixelsAvailable();
	const doesOverflow = () => $target.get(0).getBoundingClientRect().width > maxPixels;
	const {basename, topDir, folderCount} = parseFileDetails(val);

	if (doesOverflow() && folderCount > 1) {
		$target.text(`${topDir}/.../${basename}`);
	}

	if (doesOverflow()) {
		$target.text(basename);
	}

	$target.removeClass('filename-width-check');
};

const getDiffToolbarHeight = () => {
	const el = select('.pr-toolbar.is-stuck');
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

	const files = $('.file.js-details-container').get();
	return files.find(el => isFilePartlyVisible(el, toolbarHeight));
};

const diffHeaderFilename = isResize => {
	const targetDiffFile = getHighestVisibleDiffFilename();
	if (!targetDiffFile) {
		return;
	}

	const filename = targetDiffFile.querySelector('.file-header').dataset.path;

	if (!diffFile.hasChanged(filename) && !isResize) {
		return;
	}

	if (isResize) {
		const target = select('.diff-toolbar-filename');
		if (target.getBoundingClientRect().width < maxPixelsAvailable()) {
			return;
		}
	}

	updateFileLabel(filename);
};

const setup = () => {
	$(window).on('scroll.diffheader', () => diffHeaderFilename());
	const onResize = debounce(() => diffHeaderFilename(true), 200);
	$(window).on('resize.diffheader', onResize);

	$('.diffbar > .diffstat').insertAfter('.pr-review-tools');

	$(`<span class="diffbar-item diff-toolbar-filename"></span>`).insertAfter('.toc-select');
	diffFile.reset();
};

const destroy = () => {
	$(window).off('scroll.diffheader');
	$(window).off('resize.diffheader');
	$('.diff-toolbar-filename').remove();
};

export default {
	setup,
	destroy
};
