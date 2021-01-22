#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env
IFS=

if $DEPLOY_NEW_INSTANCE
then
    rm -r build
    rm -r frontend/src/contracts

    truffle migrate --network $NETWORK # deploy main contracts

    cd ethr-did-registry

    truffle migrate --network $NETWORK # deploy EthereumDIDRegistry contract

    cd ..
    node scripts/copy-contracts.js
    node scripts/seed.js
fi

if $BUILD_FRONTEND
then
    node scripts/copy-contracts.js
    cd frontend
    echo "npm install for frontend"
    npm install --silent
    npm run build
    cd ..
fi

nodemon server.js