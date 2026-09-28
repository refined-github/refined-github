/* eslint-disable @typescript-eslint/naming-convention -- React components */
import CheckCircleFillIcon from 'octicons-plain-react/CheckCircleFill';
import CircleSlashIcon from 'octicons-plain-react/CircleSlash';
import DotIcon from 'octicons-plain-react/Dot';

export type ScopeState = 'valid' | 'invalid' | undefined;

export const STANDARD_SCOPES = [
	'valid_token',
	'public_repo',
	'repo',
	'read:project',
	'workflow',
] as const;

export const apiFeaturesUrl =
	'https://github.com/search?q=repo%3Arefined-github%2Frefined-github+%28api.js+OR+does-file-exist.js+OR+get-default-branch.js+OR+get-pr-info.js+OR+pr-ci-status.js%29+path%3A%2F%5Esource%5C%2Ffeatures%5C%2F%2F&type=code';

export const SCOPE_ICON = {
	valid: {Icon: CheckCircleFillIcon, color: 'var(--rgh-green)'},
	invalid: {Icon: CircleSlashIcon, color: 'var(--rgh-red)'},
} as const;

export const defaultIcon = {Icon: DotIcon, color: 'inherit'};

export function getScopeState(scope: string, scopes?: string[]): ScopeState {
	return scopes?.includes(scope) ? 'valid' : scopes ? 'invalid' : undefined;
}
