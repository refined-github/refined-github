/* eslint-disable @typescript-eslint/no-use-before-define -- Keep tests before their context factory */

import {$optional} from 'select-dom';
import {describe, expect, it, vi} from 'vitest';

import expandLinkedDiff, {type WaitForElement} from './expand-linked-diff.js';

type RecordedEvent = {
	line: number;
	shiftKey: boolean;
};

type TestContextOptions = {
	deferred?: boolean;
	legacy?: boolean;
};

type TestContext = {
	file: HTMLElement;
	loadClicks: string[];
	recordedEvents: RecordedEvent[];
	waitForElement: WaitForElement;
};

describe('expandLinkedDiff', () => {
	it('waits for a delayed load button and selects the linked range', async () => {
		// Arrange
		const {file, loadClicks, recordedEvents, waitForElement} = createTestContext({deferred: true});
		queueMicrotask(() => {
			addLoadButton({
				file,
				name: 'target',
				loadClicks,
				onClick() {
					addReactLines(file, recordedEvents);
				},
			});
		});

		// Act
		await expandLinkedDiff('#diff-abc123R22-R28', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual(['target']);
		expect(recordedEvents).toEqual([
			{line: 22, shiftKey: false},
			{line: 28, shiftKey: true},
		]);
	});

	it('uses an existing load button when the observer already saw it', async () => {
		// Arrange
		const {file, loadClicks, recordedEvents} = createTestContext({deferred: true});
		addLoadButton({
			file,
			name: 'target',
			loadClicks,
			onClick() {
				addReactLines(file, recordedEvents);
			},
		});
		const waitForElement = async (): Promise<undefined> => undefined;

		// Act
		await expandLinkedDiff('#diff-abc123R22-R28', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual(['target']);
		expect(recordedEvents).toEqual([
			{line: 22, shiftKey: false},
			{line: 28, shiftKey: true},
		]);
	});

	it('loads and selects a deferred legacy diff', async () => {
		// Arrange
		const {loadClicks, recordedEvents, waitForElement} = createTestContext({
			deferred: true,
			legacy: true,
		});

		// Act
		await expandLinkedDiff('#diff-abc123L22-L28', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual(['target']);
		expect(recordedEvents).toEqual([
			{line: 22, shiftKey: false},
			{line: 28, shiftKey: true},
		]);
	});

	it('selects an existing React line without loading the diff', async () => {
		// Arrange
		const {loadClicks, recordedEvents, waitForElement} = createTestContext();

		// Act
		await expandLinkedDiff('#diff-abc123R22', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual([]);
		expect(recordedEvents).toEqual([
			{line: 22, shiftKey: false},
		]);
	});

	it('supports legacy line anchors', async () => {
		// Arrange
		const {loadClicks, recordedEvents, waitForElement} = createTestContext({legacy: true});

		// Act
		await expandLinkedDiff('#diff-abc123L22-L28', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual([]);
		expect(recordedEvents).toEqual([
			{line: 22, shiftKey: false},
			{line: 28, shiftKey: true},
		]);
	});

	it('ignores fragments without a line target', async () => {
		// Arrange
		const {loadClicks, recordedEvents, waitForElement} = createTestContext();

		// Act
		await expandLinkedDiff('#diff-abc123', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual([]);
		expect(recordedEvents).toEqual([]);
	});

	it('keeps large line numbers as selector-safe digit strings', async () => {
		// Arrange
		const {file, loadClicks, recordedEvents} = createTestContext({deferred: true});
		const lineNumber = '1000000000000000000000';
		const cell = document.createElement('td');
		cell.className = 'new-diff-line-number';
		cell.dataset.diffSide = 'right';
		cell.dataset.lineNumber = lineNumber;
		cell.scrollIntoView = vi.fn();
		const onSelection = vi.fn();
		cell.addEventListener('mousedown', onSelection);
		file.append(cell);
		const waitForElement = async (): Promise<undefined> => undefined;

		// Act
		await expandLinkedDiff(`#diff-abc123R${lineNumber}`, {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual([]);
		expect(recordedEvents).toEqual([]);
		expect(onSelection).toHaveBeenCalledOnce();
	});

function createTestContext({
	deferred = false,
	legacy = false,
}: TestContextOptions = {}): TestContext {
	document.body.replaceChildren();

	const recordedEvents: RecordedEvent[] = [];
	const loadClicks: string[] = [];
	const file = document.createElement('div');
	file.id = 'diff-abc123';
	file.className = 'Diff-module__diffTargetable__hash';
	file.append(createReactFileHeader(), document.createElement('div'));
	document.body.append(file);

	const otherFile = document.createElement('div');
	otherFile.id = 'diff-deadbeef';
	otherFile.className = 'Diff-module__diffTargetable__hash';
	otherFile.append(createReactFileHeader(), document.createElement('div'));
	document.body.append(otherFile);
	addLoadButton({file: otherFile, name: 'other', loadClicks});

	if (deferred && legacy) {
		addLoadButton({
			file,
			legacy: true,
			name: 'target',
			loadClicks,
			onClick() {
				addLegacyLines(file, recordedEvents);
			},
		});
	} else if (!deferred) {
		if (legacy) {
			addLegacyLines(file, recordedEvents);
		} else {
			addReactLines(file, recordedEvents);
		}
	}

	return {
		file,
		loadClicks,
		recordedEvents,
		waitForElement: createWaitForElement(),
	};
}

function createWaitForElement(): WaitForElement {
	return async (selectors: string | readonly string[], {signal}: {signal: AbortSignal}) => {
		const selector = typeof selectors === 'string' ? selectors : selectors.join(',');
		const existing = $optional(selector);
		if (existing) {
			return existing;
		}

		return new Promise<HTMLElement | undefined>(resolve => {
			const observer = new MutationObserver(() => {
				const element = $optional(selector);
				if (element) {
					finish(element);
				}
			});
			observer.observe(document, {childList: true, subtree: true});
			signal.addEventListener('abort', () => {
				finish();
			}, {once: true});

			function finish(element?: HTMLElement): void {
				observer.disconnect();
				resolve(element);
			}
		});
	};
}

function addLoadButton({
	file,
	name,
	loadClicks,
	onClick,
	legacy = false,
}: {
	file: HTMLElement;
	legacy?: boolean;
	loadClicks: string[];
	name: string;
	onClick?: () => void;
}): void {
	const button = document.createElement('button');
	if (legacy) {
		button.className = 'js-diff-load';
	}

	button.textContent = legacy ? 'Load diff' : 'Load Diff';
	button.addEventListener('click', () => {
		loadClicks.push(name);
		onClick?.();
	});
	(legacy ? file : file.lastElementChild!).append(button);
}

function createReactFileHeader(): HTMLElement {
	const header = document.createElement('div');
	header.dataset.diffHeaderWrapper = 'true';
	return header;
}

function addReactLines(file: HTMLElement, recordedEvents: RecordedEvent[]): void {
	for (const line of [22, 28]) {
		const cell = document.createElement('td');
		cell.className = 'new-diff-line-number';
		cell.dataset.diffSide = 'right';
		cell.dataset.lineNumber = String(line);
		recordLineSelection(cell, line, recordedEvents, 'mousedown');
		file.append(cell);
	}
}

function addLegacyLines(file: HTMLElement, recordedEvents: RecordedEvent[]): void {
	for (const line of [22, 28]) {
		const cell = document.createElement('td');
		cell.id = `diff-abc123L${line}`;
		recordLineSelection(cell, line, recordedEvents, 'click');
		file.append(cell);
	}
}

function recordLineSelection(
	cell: HTMLElement,
	line: number,
	recordedEvents: RecordedEvent[],
	eventName: 'click' | 'mousedown',
): void {
	cell.addEventListener(eventName, event => {
		recordedEvents.push({line, shiftKey: event.shiftKey});
	});
}

});
