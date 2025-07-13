#! /bin/bash

set -e

npm --prefix client run build
npm --prefix server run build

node server/dist/index.js