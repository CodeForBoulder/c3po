sudo apt-get update # update instance with latest updates
sudo apt-get install python-software-properties
#meteor requires node 4.X to match fibers/coroutines library
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install nodejs
sudo apt-get install npm
sudo npm install fibers
#sudo npm install bcrypt it fails to install. Using js implementation
sudo apt-get install awscli
curl https://install.meteor.com | /bin/sh
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv EA312927
sudo apt-get install -y mongodb
sudo npm install -g forever
sudo npm install -g node-inspector
until pids=$(pidof mongod) # Wait for mongo to start
do
    sleep 1
done
sudo apt-get install gcc make git libpcap0.8-dev
git clone https://github.com/jbittel/httpry.git
cd httpry
make
sudo make install
cd ~
tar -xvzf 
cd bundle/programs/server
npm install
cd ../../
#export MONGO_URL="mongodb://localhost:27017/data"
#export PORT=3333
#export ROOT_URL="http://107.21.53.136"
sudo useradd -r -m -s /bin/false c3po #System user: no login to reduce hacking exposure. It has home to run foreve package
#exit 0;
sudo -H -u c3po bash -c 'export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://107.21.53.136" ; forever start main.js &'
#export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://107.21.53.136" ; forever start main.js &
