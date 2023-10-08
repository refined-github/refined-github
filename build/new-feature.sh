#! /bin/bash

# Automatically exit on error
set -e

# create file with name provided as first argument, appending .tsx, under the folder source/features/, with a specific template

# check if argument is provided
if [ -z "$1" ]
then
	echo "Please provide a name for the feature"
	exit 1
fi

# add template
echo "import React from 'react';
import {BugIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';

function init(): void {
	document.body.prepend(<BugIcon/>);
	console.log('✨');
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isPR, // Find the one you need on https://refined-github.github.io/github-url-detection/
	],
	init,
});
" >> "source/features/$1.tsx"

# add import to refined-github.ts
echo "import './features/$1.js';" >> ./source/refined-github.ts

echo "✨ Feature created! ✨"
echo "source/features/$1.tsx"
echo
echo "After you're done, also add the feature to ./readme.md; Don't worry about the screenshot yet"
echo
echo Refer to https://github.com/refined-github/refined-github/blob/main/contributing.md for more information.
