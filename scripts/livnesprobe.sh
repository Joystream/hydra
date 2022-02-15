#!/bin/bash
if [[ ! -e old_head.txt  ]]; then 
  curl localhost:9090/metrics | grep sqd_archive_chain_last_finalized_height | awk '{print $2}' > old_head.txt
  result=1
else
  current=$(curl localhost:9090/metrics | grep sqd_archive_chain_last_finalized_height | awk '{print $2}')
  result=$current-$(cat $CHAIN.txt)
  echo "$current" > old_head.txt
fi
if [[ $result -gt 0 ]]; then
  exit 0
else
  echo "Head block of change not changed a 10 minuts"
  exit 1
fi