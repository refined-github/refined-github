import * as pageDetect from "github-url-detection";

import features from ".";
import fetchDom from "../helpers/fetch-dom";
import delegate from "delegate-it";

const MAX_IMAGES_TO_BE_FETCHED_CONCURRENTLY = 20;
// @see https://docs.github.com/en/github/managing-files-in-a-repository/working-with-non-code-files/rendering-and-diffing-images
const IMAGE_FILE_TYPES = [".jpg", ".png", ".gif", ".psd", ".svg"];

void features.add(__filebasename, {
	include: [pageDetect.isCommit, pageDetect.isPRFiles],
	init,
});

async function init(): Promise<void> {
	window.setTimeout(run, 1000);

	delegate(
		document.body,
		"include-fragment.diff-progressive-loader",
		"load",
		run
	);
}

const run = () => {
	const imageFiletypeCssSelector = IMAGE_FILE_TYPES.map((imageFileType) => {
		return `.show-inline-notes[data-file-type="${imageFileType}"][data-file-deleted="false"] .js-rendered`;
	}).join(", ");

	const richDiffButtons = Array.from(
		document.querySelectorAll(imageFiletypeCssSelector)
	);

	const unselectedRichDiffButtons = richDiffButtons.filter(
		(button) => !button.classList.contains("selected")
	);

	if (unselectedRichDiffButtons.length === 0) return;

	const richDiffButtonsForNextConcurrentFetch = unselectedRichDiffButtons.slice(
		0,
		MAX_IMAGES_TO_BE_FETCHED_CONCURRENTLY
	);

	richDiffButtonsForNextConcurrentFetch.forEach(
		async (richDiffButton: Element) => {
			await loadRichDiffAndSwitchButtonStates(richDiffButton);
		}
	);

	const lastButton =
		richDiffButtonsForNextConcurrentFetch[
			richDiffButtonsForNextConcurrentFetch.length - 1
		];
	displayLoadMoreContainer(lastButton);
};

async function loadRichDiffAndSwitchButtonStates(richDiffButton: Element) {
	const detailsContainer = richDiffButton.closest(".js-details-container");
	const richDiffForm = richDiffButton.closest(".BtnGroup-parent");

	if (detailsContainer === null || richDiffForm === null) return;

	const sourceButton = detailsContainer.querySelector("button.js-source");
	const fileContentContainer =
		detailsContainer.querySelector(".js-file-content");
	if (sourceButton === null || fileContentContainer === null) return;

	const richDiffFormAction = richDiffForm.getAttribute("action");
	if (richDiffFormAction === null) return;

	// wait some time between fetches
	const imagePreviewDocumentFragment = await fetchDom(richDiffFormAction);

	const sourceFileContent = fileContentContainer.firstElementChild;
	if (sourceFileContent === null || !(sourceFileContent instanceof HTMLElement))
		return;

	hideSourceFileContentInsteadOfReplaceToPreserveContainerFunctionality(
		sourceFileContent
	);
	fileContentContainer.append(imagePreviewDocumentFragment);

	setRichDiffButtonAsSelected(sourceButton, richDiffButton);
}

function setRichDiffButtonAsSelected(
	sourceButton: Element,
	richDiffButton: Element
) {
	sourceButton.classList.remove("selected");
	sourceButton.removeAttribute("aria-current");
	richDiffButton.classList.add("selected");
	richDiffButton.setAttribute("aria-current", "true");
}

function hideSourceFileContentInsteadOfReplaceToPreserveContainerFunctionality(
	sourceFileContent: HTMLElement
) {
	sourceFileContent.style["display"] = "none";
}

function displayLoadMoreContainer(lastButton: Element) {
	const lastDetailsContainer = lastButton.closest(".js-details-container");

	if (lastDetailsContainer === null) return;

	let lastDetailsContainerParent = lastDetailsContainer.parentNode;
	if (lastDetailsContainerParent === null) return;

	let loadMoreContainer = createLoadMoreContainer();

	lastDetailsContainerParent.insertBefore(
		loadMoreContainer,
		lastDetailsContainer.nextSibling
	);
}

function createLoadMoreContainer(): HTMLDivElement {
	let loadMoreContainer = document.createElement("div");
	loadMoreContainer.classList.add("d-flex", "flex-justify-center", "mb-4");
	let btn = document.createElement("button");
	btn.innerHTML = `Load more rich diffs`;
	btn.classList.add("btn", "ml-2", "d-none", "d-md-block");
	btn.addEventListener("click", function () {
		run();
		loadMoreContainer.remove();
	});
	loadMoreContainer.appendChild(btn);
	return loadMoreContainer;
}
