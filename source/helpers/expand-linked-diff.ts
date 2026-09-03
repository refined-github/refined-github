/* eslint-disable @typescript-eslint/no-use-before-define -- Keep the main flow before its helpers */

import {$optional} from 'select-dom';

type DiffSide = 'left' | 'right';

type LineTarget = {
	line: number;
	side: DiffSide;
};

type DiffTarget = {
	end?: LineTarget;
	fileId: string;
	start: LineTarget;
};

export type WaitForElement = (
	selectors: string | readonly string[],
	options: {signal: AbortSignal},
) => Promise<HTMLElement | undefined | void>;

type Options = {
	signal: AbortSignal;
	waitForElement: WaitForElement;
};

const fragmentPattern =
	/^#(?<fileId>diff-[\da-f]+)(?<startSide>[lr])(?<startLine>\d+)(?:-(?<endSide>[lr])(?<endLine>\d+))?$/i;

export default async function expandLinkedDiff(
	hash: string,
	{signal, waitForElement}: Options,
): Promise<void> {
	const target = parseDiffTarget(hash);
	if (!target) {
		return;
	}

	const file = $optional(`#${target.fileId}`) ?? await waitForElement(`#${target.fileId}`, {signal});
	if (!file) {
		return;
	}

	let startLine = findLine(file, target.fileId, target.start);
	if (!startLine) {
		const lineOrLoadButton = await waitForElement([
			...lineSelectors(target.fileId, target.start),
			...loadButtonSelectors(target.fileId),
		], {signal});
		if (!lineOrLoadButton) {
			return;
		}

		if (lineOrLoadButton instanceof HTMLButtonElement) {
			if (!isLoadButton(lineOrLoadButton)) {
				return;
			}

			lineOrLoadButton.click();
			startLine = await waitForLine(target.fileId, target.start, signal, waitForElement);
		} else {
			startLine = lineOrLoadButton;
		}
	}

	if (!startLine) {
		return;
	}

	const endLine = target.end
		? await waitForLine(target.fileId, target.end, signal, waitForElement)
		: undefined;
	if (!endLine && target.end) {
		return;
	}

	selectLines(startLine, endLine);
}

function parseDiffTarget(hash: string): DiffTarget | undefined {
	const match = fragmentPattern.exec(hash);
	const {fileId, startSide, startLine, endSide, endLine} = match?.groups ?? {};
	if (!fileId || !startSide || !startLine) {
		return undefined;
	}

	return {
		fileId,
		start: createLineTarget(startSide, startLine),
		end: endSide && endLine ? createLineTarget(endSide, endLine) : undefined,
	};
}

function createLineTarget(side: string, line: string): LineTarget {
	return {
		line: Number(line),
		side: side.toUpperCase() === 'L' ? 'left' : 'right',
	};
}

function findLine(file: HTMLElement, fileId: string, target: LineTarget): HTMLElement | undefined {
	return $optional(lineSelectors(fileId, target), file);
}

async function waitForLine(
	fileId: string,
	target: LineTarget,
	signal: AbortSignal,
	waitForElement: WaitForElement,
): Promise<HTMLElement | undefined> {
	return $optional(lineSelectors(fileId, target))
		?? await waitForElement(lineSelectors(fileId, target), {signal})
		?? undefined;
}

function lineSelectors(fileId: string, {line, side}: LineTarget): readonly string[] {
	const sideLetter = side === 'left' ? 'L' : 'R';
	return [
		`#${fileId}${sideLetter}${line}`,
		`#${fileId} .new-diff-line-number[data-diff-side="${side}"][data-line-number="${line}"]:not([data-line-anchor])`,
	];
}

function loadButtonSelectors(fileId: string): readonly string[] {
	return [
		`#${fileId} .js-diff-load`,
		`[class^="Diff-module__diffTargetable"][id="${fileId}"] > :not([data-diff-header-wrapper]) button`,
	];
}

function isLoadButton(button: HTMLButtonElement): boolean {
	return button.classList.contains('js-diff-load') || button.textContent.trim() === 'Load Diff';
}

function selectLines(startLine: HTMLElement, endLine: HTMLElement | undefined): void {
	if (isSelected(startLine) && (!endLine || isSelected(endLine))) {
		return;
	}

	startLine.scrollIntoView({block: 'center'});
	dispatchSelection(startLine);
	if (endLine) {
		dispatchSelection(endLine, true);
	}
}

function isSelected(line: HTMLElement): boolean {
	return line.dataset.selected === 'true'
		|| line.classList.contains('selected-line')
		|| line.classList.contains('highlighted-line');
}

function dispatchSelection(line: HTMLElement, shiftKey = false): void {
	const eventName = line.classList.contains('new-diff-line-number') ? 'mousedown' : 'click';
	line.dispatchEvent(
		new MouseEvent(eventName, {
			bubbles: true,
			cancelable: true,
			composed: true,
			shiftKey,
		}),
	);
}
