#! /bin/bash

# Automatically exit on error
set -e

ANNOTATIONS=$(mktemp)
ERRORS=0

# Keep short because GitHub doesn't wrap it
ERROR_MESSAGE="Every new or edited feature must be tested manually before merging.
To help testing, we're progressively adding test URLs in each feature.

You can find or create a test URL:

- on our sandbox repo: https://github.com/refined-github/sandbox
- on previous PRs for this feature

The section must be appended to each .tsx file:

/*

Test URLs:

https://github.com/a/REAL/url/here
https://github.com/another/REAL/url/here

*/
"

# Replace line breaks with "%0A"
# https://github.com/actions/toolkit/issues/193#issuecomment-605394935
ERROR_MESSAGE=${ERROR_MESSAGE//$'\n'/%0A}

echo WILL VERIFY:
echo

for FILE in "$@"; do
	LAST_LINE=$(wc -l < "$FILE")

	if grep -q "test url" -i "$FILE"; then
		echo ✅ "$FILE"
		echo "::notice file=$FILE,line=$LAST_LINE::✅" >> "$ANNOTATIONS"
	else
		ERRORS=$((ERRORS+1))

		echo ❌ "$FILE"
		echo "::error file=$FILE,line=$LAST_LINE::$ERROR_MESSAGE" >> "$ANNOTATIONS"
	fi
done

# Don't fail PRs that edit a large number of files
if [ "$ERRORS" -ge 1 ] && [ "$ERRORS" -le 3 ]; then
	echo ::group::GITHUB ANNOTATIONS
	cat $ANNOTATIONS
	echo ::endgroup:::
	echo
	echo VERIFICATION FAILED, "Test URLs" MISSING
	exit $ERRORS
fi
