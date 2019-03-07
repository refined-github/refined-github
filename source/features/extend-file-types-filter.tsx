import {React} from 'dom-chef/react';
import select from 'select-dom';
import debounce from 'debounce-fn';
import * as api from '../libs/api';
import features from '../libs/features';
import observeEl from '../libs/simplified-element-observer';
import {getCleanPathname} from '../libs/utils';

// --> Types and Interfaces
interface PRFile {
	fileName: string;
	isDeleted: boolean;
}

interface PRFileTypes {
	[fileType: string]: {
		count: number;
		deleted: number;
	};
}

interface State {
	prFiles: PRFile[];
	prFileTypes: PRFileTypes;
	selectedFileTypes: Set<string>;
	shouldExtendFileType: boolean;
}
// <-- Types and Interfaces

// --> State & Transitions
const state: State = {
	prFiles: [],
	prFileTypes: {},
	selectedFileTypes: new Set(),
	shouldExtendFileType: true
};

const setState = (
	diff: Partial<State>,
	callback: (updated: boolean) => any,
): void => {
	const newState: State = {...state, ...diff};
	if (JSON.stringify(state) === JSON.stringify(newState)) {
		callback(false);
		return;
	}

	Object.assign(state, newState);
	callback(true);
};
// <-- State & Transitions

// --> Helpers and Utils
const sortObject = (unsorted: AnyObject): AnyObject => {
	const sorted = {};
	for (const key of Object.keys(unsorted).sort()) {
		sorted[key] = unsorted[key];
	}

	return sorted;
};

const getPRFiles = async (): Promise<PRFile[]> => {
	const pullUrl = getCleanPathname().replace('/pull/', '/pulls/');
	const apiUrl = `repos/${pullUrl}?per_page=1000`;
	const result = await api.v3(apiUrl); // Uses v3 as v4 does not contain deleted status information
	return result.map(({status, filename}) => ({
		fileName: filename,
		isDeleted: status === 'removed'
	}));
};

const getFileType = (
	fileName: string,
	shouldExtend: boolean = state.shouldExtendFileType,
): string => {
	const basename = fileName.split('/').pop();
	const i = shouldExtend ? basename.indexOf('.') : basename.lastIndexOf('.');
	return i < 0 ? null : basename.substr(i);
};

const groupPRFileTypes = (prFiles: PRFile[]): PRFileTypes => {
	const grouped = {};
	for (const {fileName, isDeleted} of prFiles) {
		const fileType = getFileType(fileName);
		if (!fileType) {
			continue;
		}

		if (!(fileType in grouped)) {
			grouped[fileType] = {count: 0, deleted: 0};
		}

		grouped[fileType].count += 1;
		if (isDeleted) {
			grouped[fileType].deleted += 1;
		}
	}

	return sortObject(grouped);
};
// <-- Helpers and Utils

// --> DOM Element Classes and Selectors
const fileFilterSelectAllClass = 'js-file-filter-select-all-container';
const fileFilterDeselectAllClass = 'rfg-deselect-all-file-types';
const fileFilterExtendToggleId = 'rfg-extend-file-types-toggle';

const getFileFilterElement = (): HTMLElement => select('.js-file-filter');

const getFilterListElement = (): HTMLElement =>
	getFileFilterElement().querySelector('.select-menu-list .p-2');

const getFilterToggleTypeElement = (fileType: string): HTMLInputElement => {
	return getFilterListElement().querySelector(
		`.js-diff-file-type-option[value="${fileType}"]`,
	);
};
// <-- DOM Element Classes and Selectors

// --> JSX Element Constructors
const extendFileTypesToggle = ({onChange}: { onChange: () => void }) => {
	return (
		<label>
			<span>.extend.file.types </span>
			<input
				type="checkbox"
				id={fileFilterExtendToggleId}
				checked={state.shouldExtendFileType}
				onChange={onChange}
			/>
		</label>
	);
};

const fileTypeToggle = ({
	deletedCount,
	fileType,
	onChange,
	totalCount
}: {
	deletedCount: number;
	fileType: string;
	onChange: () => void;
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
					onChange={onChange}
					value={fileType}
					data-deleted-files-count={deletedCount}
					data-non-deleted-files-count={nonDeletedCount}
				/>
				{` ${fileType}`}
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

const selectAllToggle = ({
	count,
	onClick
}: {
	count: number;
	onClick: () => void;
}) => {
	const typeMarkup = count > 1 ? 'types' : 'type';
	const selectAllMarkup = `Select all ${count} file ${typeMarkup}`;
	const allSelectedMarkup = `All ${count} file ${typeMarkup} selected`;
	return (
		<div class="ml-1" style={{padding: '4px 0 0'}}>
			<label style={{cursor: 'pointer'}}>
				<input
					type="checkbox"
					class="js-file-filter-select-all"
					hidden
				/>
				<span
					class={`${fileFilterSelectAllClass} no-underline text-normal text-gray`}
					data-select-all-markup={selectAllMarkup}
					data-all-selected-markup={allSelectedMarkup}
					onClick={onClick}
				>
					{allSelectedMarkup}
				</span>
			</label>
		</div>
	);
};

const deselectAllToggle = ({
	count,
	onClick
}: {
	count: number;
	onClick: () => void;
}) => {
	const typeMarkup = count > 1 ? 'types' : 'type';
	const deselectAllMarkup = `Deselect all ${count} file ${typeMarkup}`;
	const allDeselectedMarkup = `All ${count} file ${typeMarkup} deselected`;
	return (
		<div class="ml-1" style={{padding: '6px 0 0'}}>
			<label style={{cursor: 'pointer'}}>
				<input type="checkbox" hidden />
				<span
					class={`${fileFilterDeselectAllClass} no-underline text-normal text-blue`}
					onClick={onClick}
					data-deselect-all-markup={deselectAllMarkup}
					data-all-deselected-markup={allDeselectedMarkup}
				>
					{deselectAllMarkup}
				</span>
			</label>
		</div>
	);
};
// <-- JSX Element Constructors

// --> Update DOM from State
const extendFileDetailsElements = (): void => {
	for (const elem of select.all('.file.Details')) {
		const fileHeaderElem: HTMLElement = elem.querySelector('.file-header');
		const fileType = getFileType(fileHeaderElem.dataset.path);
		fileHeaderElem.dataset.fileType = fileType || '';
	}
};

const updateFileTypesState = (): void => {
	setState(
		{
			prFileTypes: groupPRFileTypes(state.prFiles)
		},
		updated => {
			if (updated) {
				extendFileDetailsElements();
				extendFilterListElement();
			}
		},
	);
};

const onShouldExtendToggle = () => {
	const extendToggleElement: HTMLInputElement = select(`#${fileFilterExtendToggleId}`);
	setState(
		{shouldExtendFileType: extendToggleElement.checked},
		updated => {
			if (updated) {
				const numFileTypes = Object.keys(state.prFileTypes).length;
				if (state.selectedFileTypes.size !== numFileTypes) {
					const selectAllElement: HTMLElement = getFilterListElement().querySelector(`.${fileFilterSelectAllClass}`);
					selectAllElement.click();
				}

				updateFileTypesState();
			}
		},
	);
};

const updateFilterDeselectAllElement = () => {
	const {prFileTypes} = state;
	const fileTypes = Object.keys(prFileTypes);
	state.selectedFileTypes = new Set(fileTypes.filter(fileType => {
		return getFilterToggleTypeElement(fileType).checked;
	}));

	const deselectElement: HTMLElement = getFilterListElement().querySelector(`.${fileFilterDeselectAllClass}`);
	const isShowingSomeTypes = state.selectedFileTypes.size > 0;
	deselectElement.classList.remove(
		`text-${isShowingSomeTypes ? 'gray' : 'blue'}`,
	);
	deselectElement.classList.add(
		`text-${isShowingSomeTypes ? 'blue' : 'gray'}`,
	);
	const {deselectAllMarkup, allDeselectedMarkup} = deselectElement.dataset;
	deselectElement.innerText = isShowingSomeTypes ?
		deselectAllMarkup :
		allDeselectedMarkup;
};

const onDeselectAllToggle = () => {
	if (state.selectedFileTypes.size > 0) {
		for (const fileType of state.selectedFileTypes) {
			getFilterToggleTypeElement(fileType).click();
		}
	} else {
		updateFilterDeselectAllElement();
	}
};

const extendFilterListElement = (): void => {
	const filterList = getFilterListElement();
	filterList.textContent = '';
	const {prFileTypes} = state;
	const fileTypes = Object.keys(prFileTypes);
	const onChange = debounce(updateFilterDeselectAllElement, {wait: 50});
	for (const fileType of fileTypes) {
		const props = {
			fileType,
			totalCount: prFileTypes[fileType].count,
			deletedCount: prFileTypes[fileType].deleted,
			onChange
		};
		filterList.append(fileTypeToggle(props));
	}

	filterList.append(selectAllToggle({count: fileTypes.length, onClick: onChange}));
	const onClick = debounce(onDeselectAllToggle, {wait: 50});
	filterList.append(deselectAllToggle({count: fileTypes.length, onClick}));
	updateFilterDeselectAllElement();
};
// <-- Update DOM from State

// --> Initialise feature
const init = async (): Promise<void> => {
	state.prFiles = await getPRFiles();
	getFileFilterElement().querySelector('.select-menu-header').append(
		extendFileTypesToggle({onChange: onShouldExtendToggle}),
	);
	updateFileTypesState();
	observeEl('#files', extendFileDetailsElements, {childList: true});
};

features.add({
	id: 'extend-file-types-filter',
	include: [features.isPRFiles],
	load: features.onAjaxedPages,
	init
});
// <-- Initialise feature
