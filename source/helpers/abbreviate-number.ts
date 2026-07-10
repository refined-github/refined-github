import {abbreviateNumber as abbreviateNumber_} from 'js-abbreviation-number';

export default function abbreviateNumber(number: number, digits = 1): string {
	return abbreviateNumber_(number, digits, {padding: false}).toLowerCase();
}
