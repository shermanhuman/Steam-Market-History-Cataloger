#!/bin/sh
rm -rf ./dist/marketcataloger
mkdir -p dist
mkdir ./dist/marketcataloger

cp -a ./js ./dist/marketcataloger/js
cp -a ./images ./dist/marketcataloger/images
cp -a ./css ./dist/marketcataloger/css
cp -a ./json ./dist/marketcataloger/json
cp -a ./views ./dist/marketcataloger/views
cp -a ./manifest.json ./dist/marketcataloger/manifest.json
cp -a ./README.md ./dist/marketcataloger/README.md

cd ./dist/marketcataloger

zip -r marketcataloger.zip ./*

cd -

mv ./dist/marketcataloger/marketcataloger.zip ./dist/marketcataloger.zip