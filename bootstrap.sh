#!/usr/bin/env bash
apt-get update
# Install essentials, sqlite3, openssl, git
apt-get -y install git-core curl zlib1g-dev build-essential libssl-dev libreadline-dev libyaml-dev libsqlite3-dev sqlite3 libxml2-dev libxslt1-dev libcurl4-openssl-dev python-software-properties libffi-dev
# Install RVM, Ruby, Rails, and Gem Bundler
apt-get -y install libgdbm-dev libncurses5-dev automake libtool bison libffi-dev
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
curl -sSL https://get.rvm.io | bash -s stable --ruby=2.2.2 --rails
source ~/.rvm/scripts/rvm
rvm use 2.2.2 --default
gem install bundler
# Git color
git config --global color.ui true
# Install Node.js
add-apt-repository ppa:chris-lea/node.js
apt-get update
apt-get -y install nodejs
# Install Compass 
gem install compass 
# Install Postgres and create vagrant user
sh -c "echo 'deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main' > /etc/apt/sources.list.d/pgdg.list"
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | apt-key add -
apt-get update
apt-get -y install postgresql-common
apt-get -y install postgresql-9.3 libpq-dev
sudo -u postgres bash -c "psql -c \"CREATE USER vagrant WITH SUPERUSER CREATEDB REPLICATION;\""

