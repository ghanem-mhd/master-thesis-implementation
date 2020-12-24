#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env
IFS=

if [[ "$NETWORK" = "ganache-cli" ]] ; then
    cd blockchain/ganache-cli
    docker-compose down -v
    cd ../..
fi

if [[ "$NETWORK" = "quorum" ]] ; then
    cd blockchain/quorum
    docker-compose down -v
    cd ../..
fi

docker-compose down -v