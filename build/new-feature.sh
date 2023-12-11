#! /bin/bash

# Automatically exit on error
set -e

if [ -z "$1" ]
then
	echo "Please provide a name for the feature"
	exit 1
fi

echo "import React from 'react';
import {BugIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

function applyToButton(button: HTMLButtonElement): void {
	button.append(<BugIcon/>);
	console.log('✨');
}

function init(signal: AbortSignal): void {
	observe('button.btn', applyToButton, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR, // Find the one you need on https://refined-github.github.io/github-url-detection/
	],
	init,
});
" >> "source/features/$1.tsx"

echo "import './features/$1.js';" >> ./source/refined-github.ts

echo "✨ Feature created! ✨"
echo "source/features/$1.tsx"
echo
echo "After you're done, also add the feature to ./readme.md; Don't worry about the screenshot yet"
echo
echo Refer to https://github.com/refined-github/refined-github/blob/main/contributing.md for more information.
