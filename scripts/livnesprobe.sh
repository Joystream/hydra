#!/bin/bash
name=$DB_NAME
if [[ ! -e $name_status_old_value.txt  ]]; then 
  curl -X POST https://$name.indexer.gc.subsquid.io/v4/graphql -d '{"query":"query MyQuery {\n  indexerStatus {\n    head\n  }\n}\n","variables":null,"operationName":"MyQuery"}' | jq .data.indexerStatus.head > $hame_status_old_value.txt
  result=1
else
  current=$(curl -X POST https://$name.indexer.gc.subsquid.io/v4/graphql -d '{"query":"query MyQuery {\n  indexerStatus {\n    head\n  }\n}\n","variables":null,"operationName":"MyQuery"}' | jq .data.indexerStatus.head)
  result=$current-$(cat $name_status_old_value.txt)
fi
if [[ $result -gt 0 ]]; then
  echo "$current" > $name_status_old_value.txt
  exit 0
else
  exit 1
fi