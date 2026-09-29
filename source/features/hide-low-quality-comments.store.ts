import {writable} from 'svelte/store';

const lowQualityCount = writable(0);

export default lowQualityCount;
