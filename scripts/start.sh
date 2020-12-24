#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env
IFS=

if [[ "$NETWORK" = "ganache-cli" ]] ; then
    cd blockchain/ganache-cli
    docker-compose up -d
    cd ../..
fi

if [[ "$NETWORK" = "quorum" ]] ; then
    cd blockchain/quorum
    docker-compose up -d
    cd ../..
fi

docker-compose up
