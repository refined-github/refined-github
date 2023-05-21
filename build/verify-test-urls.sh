#! /bin/bash

# Automatically exit on error
set -e

ERRORS=0

# Keep short because GitHub doesn't wrap it
ANNOTATION="Test URLs missing.
The section must be appended to each .tsx file:

/*

Test URLs:

https://github.com/a/REAL/url/here
https://github.com/another/REAL/url/here

*/

You can find or create a test URL on our sandbox repo: https://github.com/refined-github/sandbox
"

# Replace line breaks with "%0A"
# https://github.com/actions/toolkit/issues/193#issuecomment-605394935
ANNOTATION=${ANNOTATION//$'\n'/%0A}

echo WILL VERIFY:
echo

for FILE in "$@"; do
	if grep -q "test url" -i "$FILE"; then
		echo ✅ "$FILE"
	else
		ERRORS=$((ERRORS+1))

		echo ❌ "$FILE"
		echo "::error file=$FILE,line=1::$ANNOTATION"
	fi
done

# Don't fail PRs that edit a large number of files
if [ "$ERRORS" -ge 1 ] && [ "$ERRORS" -le 3 ]; then
	echo
	echo VERIFICATION FAILED, "Test URLs" MISSING
	exit $ERRORS
fi
