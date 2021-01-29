#!/bin/bash

ROOT=`pwd`
echo $ROOT
NM="${ROOT}/node_modules"
echo $NM
RINI="${NM}/@rini"
echo $RINI

rm -rf $RINI
mkdir -p $RINI

cd ../client
echo `pwd`
yarn pack -f $RINI/client.tgz
cd ../common
echo `pwd`
yarn pack -f $RINI/common.tgz

cd $RINI
echo `pwd`
tar -xzf client.tgz
mv package client
tar -xzf common.tgz
mv package common

rm *.tgz
ls $RINI
