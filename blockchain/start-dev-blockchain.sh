#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env
IFS=

pkill -f ganache-cli # stop the running instance if

ganache-cli --account="$ADMIN_PRIVATE_KEY,1344395000000000000000000" --blockTime=1 --port=23000