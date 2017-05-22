#!/usr/bin/env bash

# Install CouchDB PPA
apt-get install software-properties-common
add-apt-repository ppa:couchdb/stable

# Installing node.js
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -

apt-get update
apt-get upgrade

apt-get install -y nodejs couchdb

node /vagrant/scripts/setup.js
