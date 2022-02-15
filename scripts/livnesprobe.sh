#!/bin/bash
if [[ -n "$DB_NAME" ]]; then
    CHAIN="$DB_NAME"
else
  echo "Environment variable DB_NAME not set"
  exit 1
fi
if [[ ! -e $CHAIN.txt  ]]; then 
  curl -X POST https://$CHAIN.indexer.gc.subsquid.io/v4/graphql -d '{"query":"query MyQuery {\n  indexerStatus {\n    head\n  }\n}\n","variables":null,"operationName":"MyQuery"}' | jq .data.indexerStatus.head > $CHAIN.txt
  result=1
else
  current=$(curl -X POST https://$CHAIN.indexer.gc.subsquid.io/v4/graphql -d '{"query":"query MyQuery {\n  indexerStatus {\n    head\n  }\n}\n","variables":null,"operationName":"MyQuery"}' | jq .data.indexerStatus.head)
  result=$current-$(cat $CHAIN.txt)
  echo "$current" > $CHAIN.txt
fi
if [[ $result -gt 0 ]]; then
  exit 0
else
  echo "Head block of change not changed a 10 minuts"
  exit 1
fi