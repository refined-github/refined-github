import {describe, expect, it, vi} from 'vitest';

import {findWorkflowJob, getActionsRunId} from '../features/rerun-workflow-from-pr.js';

vi.mock('../feature-manager.js', () => ({
	default: {add: vi.fn()},
}));
vi.mock('../github-helpers/api.js', () => ({default: {v3uncached: vi.fn()}}));
vi.mock('../github-helpers/toast.js', () => ({default: vi.fn()}));
vi.mock('./selector-observer.js', () => ({default: vi.fn()}));

describe('getActionsRunId', () => {
	it('extracts the run ID from a GitHub Actions URL', () => {
		expect(getActionsRunId('/refined-github/refined-github/actions/runs/123/job/456')).toBe('123');
	});

	it('rejects third-party check URLs', () => {
		expect(getActionsRunId('https://example.com/checks/123')).toBeUndefined();
	});
});

describe('findWorkflowJob', () => {
	it('uses the workflow-qualified job name', () => {
		const jobs = [
			{id: 1, name: 'test', workflow_name: 'CI'},
			{id: 2, name: 'unit test', workflow_name: 'CI'},
		];

		expect(findWorkflowJob(jobs, 'CI / unit test (pull_request)')?.id).toBe(2);
	});

	// Regression: `Check:` is part of the workflow name, not a decoration to strip
	it('matches a workflow whose name starts with "Check:"', () => {
		const jobs = [
			{id: 1, name: 'validate-ticket / Validate ClickUp Ticket', workflow_name: 'Check: ClickUp Ticket Validation'},
		];

		expect(findWorkflowJob(jobs, 'Check: ClickUp Ticket Validation / validate-ticket / Validate ClickUp Ticket (pull_request)')?.id).toBe(1);
	});

	it('does not select a same-named job from another workflow', () => {
		const jobs = [
			{id: 1, name: 'build', workflow_name: 'Release'},
			{id: 2, name: 'build', workflow_name: 'CI'},
		];

		expect(findWorkflowJob(jobs, 'CI / build (pull_request)')?.id).toBe(2);
	});
});
