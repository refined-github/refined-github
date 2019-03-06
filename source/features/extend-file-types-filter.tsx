import {React} from 'dom-chef/react';
import select from 'select-dom';
import debounce from 'debounce-fn';
import * as api from '../libs/api';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {getCleanPathname} from '../libs/utils';

interface PRFile {
	fileExt: string;
	deleted: boolean;
}

interface PRFileExts {
	[fileExt: string]: {
		count: number;
		deleted: number;
	};
}

const state: {
	extensionsShowing: Set<string>;
	prFilesSortedByExt: PRFileExts;
	shouldUseFullExt: boolean;
} = {
	extensionsShowing: new Set(),
	prFilesSortedByExt: {},
	shouldUseFullExt: true
};
const fileListLimit = 1000;
const deletedStatus = 'removed';
const fileFilterInputClass = 'js-diff-file-type-option';
const fileFilterSelectAllClass = 'js-file-filter-select-all-container';
const fileFilterDeselectAllClass = 'rfg-deselect-all-file-types';

const filterLabelStyle = {
	cursor: 'pointer'
};

const setState = (diff: AnyObject, callback: () => any) => {
	const newState = {...state, ...diff};
	if (JSON.stringify(state) === JSON.stringify(newState)) {
		return;
	}

	Object.assign(state, newState);
	callback();
};

let getPRFiles = (): PRFile[] => [];
const getPRFilesPartialState = (): {
	prFilesSortedByExt: PRFileExts;
} => {
	const prFilesSortedByExt = groupAndSortPRFilesByExt(getPRFiles());
	return {prFilesSortedByExt};
};

const getToggleForExtension = (
	wrapperElement: HTMLElement,
	extension: string,
): HTMLInputElement => {
	return wrapperElement.querySelector(
		`.${fileFilterInputClass}[value="${extension}"]`,
	);
};

const getExtensionsChecked = (extensionList: string[]) => {
	const filterListElement = getFilterListElement();
	return extensionList.filter(extension => {
		return getToggleForExtension(filterListElement, extension).checked;
	});
};

const getIsShowingAllExtensions = () => {
	const numExtensions = Object.keys(state.prFilesSortedByExt).length;
	return state.extensionsShowing.size !== numExtensions;
};

const getIsShowingSomeExtensions = () => {
	return state.extensionsShowing.size > 0;
};

const syncFilterListToggles = debounce(() => {
	const prFilesByExt = state.prFilesSortedByExt;
	const fileExtensions = Object.keys(prFilesByExt);
	state.extensionsShowing = new Set(getExtensionsChecked(fileExtensions));

	const deselectElem = getDeselectAllFilterElement();
	const isShowingSomeExt = getIsShowingSomeExtensions();
	deselectElem.className = deselectToggleClasses(isShowingSomeExt);
	const {deselectAllMarkup, allDeselectedMarkup} = deselectElem.dataset;
	deselectElem.innerText = isShowingSomeExt ?
		deselectAllMarkup :
		allDeselectedMarkup;
}, {wait: 50});

const filterOption = ({
	deletedCount,
	fileExtension,
	totalCount
}: {
	deletedCount: number;
	fileExtension: string;
	totalCount: number;
}) => {
	const nonDeletedCount = totalCount - deletedCount;
	const markup = (count: number): string => `(${count})`;
	return (
		<div class="d-flex">
			<label class="pl-1 mb-1">
				<input
					class="js-diff-file-type-option"
					type="checkbox"
					checked={true}
					onChange={syncFilterListToggles}
					value={fileExtension}
					data-deleted-files-count={deletedCount}
					data-non-deleted-files-count={nonDeletedCount}
				/>
				{` ${fileExtension}`}
				<span
					class="text-normal js-file-type-count"
					data-all-file-count-markup={markup(totalCount)}
					data-deleted-file-count-markup={markup(deletedCount)}
					data-non-deleted-file-count-markup={markup(nonDeletedCount)}
				>
					{markup(totalCount)}
				</span>
			</label>
		</div>
	);
};

const selectToggle = ({count}: { count: number }) => {
	const typeMarkup = count > 1 ? 'types' : 'type';
	const selectAllMarkup = `Select all ${count} file ${typeMarkup}`;
	const allSelectedMarkup = `All ${count} file ${typeMarkup} selected`;
	return (
		<div class="ml-1" style={{padding: '4px 0 0'}}>
			<label style={filterLabelStyle}>
				<input
					type="checkbox"
					class="js-file-filter-select-all"
					hidden
				/>
				<span
					class={`${fileFilterSelectAllClass} no-underline text-normal text-gray`}
					data-select-all-markup={selectAllMarkup}
					data-all-selected-markup={allSelectedMarkup}
					onClick={syncFilterListToggles}
				>
					{allSelectedMarkup}
				</span>
			</label>
		</div>
	);
};

const deselectToggleClasses = (isShowingSomeExt: boolean): string => {
	return [
		fileFilterDeselectAllClass,
		'no-underline',
		'text-normal',
		isShowingSomeExt ? 'text-blue' : 'text-gray'
	].join(' ');
};

const deselectToggle = ({count}: { count: number }) => {
	const typeMarkup = count > 1 ? 'types' : 'type';
	const deselectAllMarkup = `Deselect all ${count} file ${typeMarkup}`;
	const allDeselectedMarkup = `All ${count} file ${typeMarkup} deselected`;
	const isShowingSomeExt = getIsShowingSomeExtensions();
	const deselectAll = debounce(() => {
		if (!getIsShowingSomeExtensions()) {
			return;
		}

		const filterListElem = getFilterListElement();
		state.extensionsShowing.forEach(extension => {
			const toggleElem = getToggleForExtension(filterListElem, extension);
			toggleElem.click();
		});
		syncFilterListToggles();
	}, {wait: 50});

	return (
		<div class="ml-1" style={{padding: '6px 0 0'}}>
			<label style={filterLabelStyle}>
				<input type="checkbox" hidden />
				<span
					class={deselectToggleClasses(isShowingSomeExt)}
					onClick={deselectAll}
					data-deselect-all-markup={deselectAllMarkup}
					data-all-deselected-markup={allDeselectedMarkup}
				>
					{isShowingSomeExt ? deselectAllMarkup : allDeselectedMarkup}
				</span>
			</label>
		</div>
	);
};

const getExt = (
	filename: string,
	full: boolean = state.shouldUseFullExt,
): string => {
	const extDelimiter = '.';
	const basename = filename.split('/').pop();
	const i = full ?
		basename.indexOf(extDelimiter) :
		basename.lastIndexOf(extDelimiter);
	return i < 0 ? null : basename.substr(i);
};

const getAllFileDetailsElements = (): HTMLElement[] =>
	select.all('.file.Details');

const getFileFilterElement = (): HTMLElement => select('.js-file-filter');

const getFilterHeaderElement = (): HTMLElement =>
	getFileFilterElement().querySelector('.select-menu-header');

const getFilterListElement = (): HTMLElement =>
	getFileFilterElement().querySelector('.select-menu-list .p-2');

const getSelectAllFilterElement = (): HTMLElement =>
	getFilterListElement().querySelector(`.${fileFilterSelectAllClass}`);

const getDeselectAllFilterElement = (): HTMLElement =>
	getFilterListElement().querySelector(`.${fileFilterDeselectAllClass}`);

const extendPRFileElements = (): HTMLElement[] =>
	getAllFileDetailsElements().map(elem => {
		const fileHeaderElem: HTMLElement = elem.querySelector('.file-header');
		const fileExt = getExt(fileHeaderElem.dataset.path);
		fileHeaderElem.dataset.fileType = fileExt || '';
		return fileHeaderElem;
	});

const getPRFilesFromDom = (): PRFile[] =>
	extendPRFileElements().map(elem => {
		return {
			deleted: elem.dataset.fileDeleted === 'true',
			fileExt: elem.dataset.fileType
		};
	});

const getPRFilesFromApi = async (): Promise<{
	end: PRFile[];
	full: PRFile[];
}> => {
	const pullUrl = getCleanPathname().replace('/pull/', '/pulls/');
	const apiUrl = `repos/${pullUrl}?per_page=${fileListLimit}`;
	try {
		const result = await api.v3(apiUrl);
		const end = result.map(({status, filename}) => {
			return {
				deleted: status === deletedStatus,
				fileExt: getExt(filename, false)
			};
		});
		const full = result.map(({status, filename}) => {
			return {
				deleted: status === deletedStatus,
				fileExt: getExt(filename, true)
			};
		});
		return {end, full};
	} catch (error) {
		return null;
	}
};

const groupPRFilesByExt = (prFiles: PRFile[]): PRFileExts =>
	prFiles.reduce((accumulator, {fileExt, deleted}) => {
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

const groupAndSortPRFilesByExt = (prFiles: PRFile[]): PRFileExts => {
	const prFilesByExt = groupPRFilesByExt(prFiles);
	const fileExtensions = Object.keys(prFilesByExt);
	const prFilesSortedByExt = {};
	fileExtensions.sort().forEach(fileExtension => {
		prFilesSortedByExt[fileExtension] = prFilesByExt[fileExtension];
	});
	return prFilesSortedByExt;
};

const refineFilterHeaderElement = (onPRFileListUpdated: () => any): void => {
	const toggleElemId = 'rfg-should-use-full-ext';
	const onShouldUseFullExtToggle = () => {
		setState({shouldUseFullExt: toggleElem.checked}, () => {
			if (getIsShowingAllExtensions()) {
				getSelectAllFilterElement().click();
			}

			onPRFileListUpdated();
		});
	};

	const toggleElem = (
		<input
			type="checkbox"
			id={toggleElemId}
			checked={state.shouldUseFullExt}
			onChange={onShouldUseFullExtToggle}
		/>
	);
	const headerElem = getFilterHeaderElement();
	headerElem.append(
		<label>
			<span>.by.full.extension </span>
			{toggleElem}
		</label>,
	);
};

const cleanFilterListElement = () => {
	const filterList = getFilterListElement();
	while (filterList.firstChild) {
		filterList.removeChild(filterList.firstChild);
	}

	return filterList;
};

const refineFilterListElement = (): void => {
	const filterList = cleanFilterListElement();
	const prFilesByExt = state.prFilesSortedByExt;
	const fileExtensions = Object.keys(prFilesByExt);
	fileExtensions.sort().forEach(fileExtension => {
		const props = {
			fileExtension,
			totalCount: prFilesByExt[fileExtension].count,
			deletedCount: prFilesByExt[fileExtension].deleted
		};
		filterList.append(filterOption(props));
	});
	filterList.append(selectToggle({count: fileExtensions.length}));
	filterList.append(deselectToggle({count: fileExtensions.length}));
	syncFilterListToggles();
};

const init = async (): Promise<void> => {
	const prFiles = await getPRFilesFromApi();
	const hasCompleteList = prFiles !== null;
	getPRFiles = hasCompleteList ?
		() => (state.shouldUseFullExt ? prFiles.full : prFiles.end) :
		getPRFilesFromDom;
	if (hasCompleteList) {
		Object.assign(state, getPRFilesPartialState());
	}

	refineFilterListElement();
	const onPRFileListUpdated = (): void => {
		if (hasCompleteList) {
			extendPRFileElements();
		}

		setState(getPRFilesPartialState(), refineFilterListElement);
	};

	refineFilterHeaderElement(onPRFileListUpdated);

	observeEl('#files', onPRFileListUpdated, {
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
