import './remove-diff-signs.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-remove-diff-signs');
}

features.add({
	id: __featureName__,
	description: 'Hides diff signs (+-) since diffs are color coded already.',
	screenshot: 'https://user-images.githubusercontent.com/1402241/54807718-149cec80-4cb9-11e9-869c-e265863211e3.png',
	init
});
