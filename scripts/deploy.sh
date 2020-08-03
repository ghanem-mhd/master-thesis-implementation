#!/usr/bin/env bash
IFS='
'
export $(egrep -v '^#' ./.env | xargs -0) # load env 
IFS=

pkill -f ganache-cli # stop the running instance if 

nohup ganache-cli -m $ADMIN_MNEMONIC -e 1000 > /dev/null 2>&1 & # run new blockchain with admin mnemonic

truffle migrate --network dev_cli # deploy main contracts

cd ethr-did-registry

truffle migrate --network dev_cli # deploy EthereumDIDRegistry contract
