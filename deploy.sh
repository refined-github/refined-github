#!/bin/bash
set -ev
echo `zip -r extension.zip extension/`
echo `grunt`
