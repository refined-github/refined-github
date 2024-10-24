import {describe, it, expect} from 'vitest';

import createEventIterator from './event-listener-loop.js';

describe('createEventIterator', () => {
	it('should yield events when they occur', async () => {
		const target = new EventTarget();
		const eventName = 'test-event';
		const iterator = createEventIterator(target, eventName);
		const event = new Event(eventName);

		setTimeout(() => target.dispatchEvent(event), 22);

		const result = await iterator.next();
		expect(result.value).toBe(event);
		expect(result.done).toBe(false);
	});

	it('should stop yielding events when signal is aborted', async () => {
		const target = new EventTarget();
		const eventName = 'test-event';
		const controller = new AbortController();
		const iterator = createEventIterator(target, eventName, {signal: controller.signal});
		const event = new Event(eventName);

		setTimeout(() => {
			target.dispatchEvent(event);
			controller.abort();
		}, 22);

		const result = await iterator.next();
		expect(result.value).toBe(event);
		expect(result.done).toBe(false);

		const abortedResult = await iterator.next();
		expect(abortedResult.value).toBe(undefined);
		expect(abortedResult.done).toBe(true);
	});

	it('should handle multiple events', async () => {
		const target = new EventTarget();
		const eventName = 'test-event';
		const iterator = createEventIterator(target, eventName);
		const event1 = new Event(eventName);
		const event2 = new Event(eventName);

		setTimeout(() => {
			target.dispatchEvent(event1);
			target.dispatchEvent(event2);
		}, 22);

		const result1 = await iterator.next();
		expect(result1.value).toBe(event1);
		expect(result1.done).toBe(false);

		const result2 = await iterator.next();
		expect(result2.value).toBe(event2);
		expect(result2.done).toBe(false);
	});

	it.skip('should handle synchronous events', async () => {
		const target = new EventTarget();
		const eventName = 'test-event';
		const iterator = createEventIterator(target, eventName);
		const event = new Event(eventName);

		// This fails because native async generator functions aren't actually executed when called…
		target.dispatchEvent(event);

		const result = await iterator.next();
		expect(result.value).toBe(event);
		expect(result.done).toBe(false);
	});
});
