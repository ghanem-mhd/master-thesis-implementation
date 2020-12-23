#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env
IFS=

if $DEPLOY
then
    rm -r build
    rm -r frontend/src/contracts

    truffle migrate --network $NETWORK # deploy main contracts

    cd ethr-did-registry

    truffle migrate --network $NETWORK # deploy EthereumDIDRegistry contract

    cd ..

    node scripts/seed.js
    node scripts/copy-contracts.js
fi

node server.js