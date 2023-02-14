#!/bin/sh

set -e

slweb index.slw > index.html

rsync -rv --delete \
    index.html logo_small.png favicon.ico \
    server:/var/www/grenug/
