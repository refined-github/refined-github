#! /bin/bash

# Automatically exit on error
set -e

EXIT_CODE=0

# Keep short because GitHub doesn't wrap it
ANNOTATION="Test URLs missing.
The section must be appended to each .tsx file:

/*

Test URLs:

https://github.com/a/REAL/url/here
https://github.com/another/REAL/url/here

*/
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
		EXIT_CODE=1
		echo ❌ "$FILE"
		echo "::error file=$FILE,line=1::$ANNOTATION"
	fi
done

if [ $EXIT_CODE -eq 1 ]; then
	echo
	echo VERIFICATION FAILED, "Test URLs" MISSING
	exit $EXIT_CODE
fi
