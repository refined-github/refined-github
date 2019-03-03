import {React} from 'dom-chef/react';
import select from 'select-dom';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';

/**
 * The file filter extension checkbox element
 * @returns {JSX.Element} element
 */
const filterOption = ({
	fileExtension,
	numTotal,
	numDeleted
}: {
	fileExtension: string;
	numTotal: number;
	numDeleted: number;
}) => {
	const allFileCount = `(${numTotal})`;
	const nonDeletedFileCount = `(${numTotal - numDeleted})`;
	return (
		<div class="d-flex">
			<label class="pl-1 mb-1">
				<input
					class="js-diff-file-type-option"
					type="checkbox"
					checked=""
					value={fileExtension}
				/>
				{` ${fileExtension}`}
				<span
					class="text-normal js-file-type-count"
					data-non-deleted-file-count={nonDeletedFileCount}
					data-all-file-count={allFileCount}
				>
					{allFileCount}
				</span>
			</label>
		</div>
	);
};

/**
 * The file filter deleted toggle element
 * @returns {JSX.Element} element
 */
const deletedToggle = ({count}: { count: number }) => {
	const typeMarkup = count > 1 ? 'types' : 'type';
	const selectAllMarkup = `Select all ${count} file ${typeMarkup}`;
	const allSelectedMarkup = `All ${count} file ${typeMarkup} selected`;
	return (
		<div class="ml-1">
			<label>
				<input
					type="checkbox"
					class="js-file-filter-select-all"
					hidden
				/>
				<span
					class="no-underline text-normal js-file-filter-select-all-container text-gray"
					data-select-all-markup={selectAllMarkup}
					data-all-selected-markup={allSelectedMarkup}
				>
					{allSelectedMarkup}
				</span>
			</label>
		</div>
	);
};

/**
 * Gets the file extension starting including the first dot
 * @param {string} filename complete filename with extension
 * @returns {string} `null` if no file extension found
 */
const getFullExt = filename => {
	const i = filename.indexOf('.');
	return i < 0 ? null : filename.substr(i);
};

/**
 * Gets all PR files on the page. Uses the DOM tree to find the files.
 * Splits the filename from the path and then the full file extension.
 * As well as the deleted status from the file DOM element
 * @returns {[{}]} list of objects, each one defining a pr file
 */
const getPRFiles = () =>
	select.all('.file.Details').map(elem => {
		const fileHeaderElem: HTMLElement = elem.querySelector('.file-header');
		const {path, fileDeleted} = fileHeaderElem.dataset;
		const fileExt = getFullExt(path.split('/').pop());
		fileHeaderElem.dataset.fileType = fileExt || '';
		return {
			fileExt,
			deleted: fileDeleted === 'true'
		};
	});

/**
 * Group PR files by extension aggregating total and deleted counts
 * @returns {{}} object map of file extensions to combined details
 */
const getPRFilesByExt = () =>
	getPRFiles().reduce((accumulator, {fileExt, deleted}) => {
		if (!fileExt) {
			return accumulator;
		}

		if (!(fileExt in accumulator)) {
			accumulator[fileExt] = {count: 0, deleted: 0};
		}

		accumulator[fileExt].count += 1;
		if (deleted) {
			accumulator[fileExt].deleted += 1;
		}

		return accumulator;
	}, {});

/**
 * Hash an object to be used as an id
 * @param {{}} obj object to hash
 * @returns {string} object hash code
 */
const hashObject = obj => {
	const stringObject = JSON.stringify(obj);
	let i = stringObject.length;
	let hash = 0;
	while (i--) {
		const chr = stringObject.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}

	return hash.toString();
};

/**
 * Get PR files type information and replace Github default filter list
 */
const extendFileTypesFilter = () => {
	const prFilesByExt = getPRFilesByExt();
	const hashCode = hashObject(prFilesByExt);
	const filterList: HTMLElement = select('.select-menu-list .p-2');
	if (filterList.dataset.hashKey === hashObject(prFilesByExt)) {
		return;
	}

	while (filterList.firstChild) {
		filterList.removeChild(filterList.firstChild);
	}

	const fileExtensions = Object.keys(prFilesByExt);
	fileExtensions.sort().forEach(fileExtension => {
		const props = {
			fileExtension,
			numTotal: prFilesByExt[fileExtension].count,
			numDeleted: prFilesByExt[fileExtension].deleted
		};
		filterList.append(filterOption(props));
	});
	filterList.append(deletedToggle({count: fileExtensions.length}));
	filterList.dataset.hashKey = hashCode;
};

/**
 * Listen to subtree changes to Github PR files and updates filter list
 */
const init = () => {
	observeEl('#files', extendFileTypesFilter, {
		childList: true,
		subtree: true
	});
};

features.add({
	id: 'extend-file-types-filter',
	include: [features.isPRFiles],
	load: features.onAjaxedPages,
	init
});
