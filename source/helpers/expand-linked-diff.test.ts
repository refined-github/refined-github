import {describe, expect, it} from 'vitest';

import expandLinkedDiff from './expand-linked-diff.js';

type RecordedEvent = {
	line: number;
	shiftKey: boolean;
};

type TestContextOptions = {
	deferred?: boolean;
	hash?: string;
	legacy?: boolean;
};

describe('expandLinkedDiff', () => {
	it('waits for a delayed load button and selects the linked range', async () => {
		// Arrange
		const {file, loadClicks, recordedEvents, waitForElement} = createTestContext({deferred: true});
		queueMicrotask(() => {
			addLoadButton(file, loadClicks, () => {
				addReactLines(file, recordedEvents);
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
		const {loadClicks, recordedEvents, waitForElement} = createTestContext({
			hash: '#diff-abc123',
		});

		// Act
		await expandLinkedDiff('#diff-abc123', {
			signal: AbortSignal.timeout(100),
			waitForElement,
		});

		// Assert
		expect(loadClicks).toEqual([]);
		expect(recordedEvents).toEqual([]);
	});
});

function createTestContext({
	deferred = false,
	hash = '#diff-abc123R22-R28',
	legacy = false,
}: TestContextOptions = {}) {
	document.body.replaceChildren();
	location.hash = hash;

	const recordedEvents: RecordedEvent[] = [];
	const loadClicks: string[] = [];
	const file = document.createElement('div');
	file.id = 'diff-abc123';
	document.body.append(file);

	const otherFile = document.createElement('div');
	otherFile.id = 'diff-deadbeef';
	document.body.append(otherFile);
	addLoadButton(otherFile, 'other', () => {});

	if (!deferred) {
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

function createWaitForElement() {
	return async (selectors: string | readonly string[], {signal}: {signal: AbortSignal}) => {
		const selector = typeof selectors === 'string' ? selectors : selectors.join(',');
		const existing = document.querySelector<HTMLElement>(selector);
		if (existing) {
			return existing;
		}

		return new Promise<HTMLElement | undefined>(resolve => {
			const observer = new MutationObserver(() => {
				const element = document.querySelector<HTMLElement>(selector);
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

function addLoadButton(file: HTMLElement, loadClicks: string[] | string, onClick: () => void): void {
	const button = document.createElement('button');
	button.className = 'js-diff-load';
	button.textContent = 'Load Diff';
	button.addEventListener('click', () => {
		if (Array.isArray(loadClicks)) {
			loadClicks.push('target');
		}

		onClick();
	});
	file.append(button);
}

function addReactLines(file: HTMLElement, recordedEvents: RecordedEvent[]): void {
	for (const line of [22, 28]) {
		const cell = document.createElement('td');
		cell.className = 'new-diff-line-number';
		cell.dataset.diffSide = 'right';
		cell.dataset.lineNumber = String(line);
		recordLineSelection(cell, line, recordedEvents);
		file.append(cell);
	}
}

function addLegacyLines(file: HTMLElement, recordedEvents: RecordedEvent[]): void {
	for (const line of [22, 28]) {
		const cell = document.createElement('td');
		cell.id = `diff-abc123L${line}`;
		recordLineSelection(cell, line, recordedEvents);
		file.append(cell);
	}
}

function recordLineSelection(cell: HTMLElement, line: number, recordedEvents: RecordedEvent[]): void {
	cell.addEventListener('mousedown', event => {
		recordedEvents.push({line, shiftKey: event.shiftKey});
	});
}
