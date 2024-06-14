#! /bin/bash

cd test/fixtures

COOKIES=$(cookies https://github.com)
echo "$COOKIES"
curl --cookie "$COOKIES" https://github.com/notifications > notifications.html
prettier . --write
