import {abbreviateNumber} from 'js-abbreviation-number';

export default function issueNumberFormat(count: number): string {
	return abbreviateNumber(count, 1, {padding: false}).toLowerCase();
}
