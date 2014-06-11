#!/bin/sh

if [ $(ps aux | grep $USER | grep domo.js | grep -v grep | wc -l | tr -s "\n") -eq 0 ]
then
  export NODE_ENV=production
  export PATH=/usr/local/bin:$PATH
  forever -e logs/errors.log -o logs/output.log start ~/domo/domo.js > /dev/null
fi
