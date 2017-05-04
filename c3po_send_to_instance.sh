if [ -z "$1" ] || [ -z "$2" ]
then
  echo "USAGE: sh $0 PATH_TO_PEM INSTANCE_URL"
  exit 1
fi
branch=`pwd` #this is the dir where the source is.
parent=`dirname $branch` # this is the parent dir of $branch
release="/release" # Where meteor will dump the built app
rm -fr $parent$release # clean previous build
meteor build $parent$release # build c3po
output=`ls $parent$release` # get the name of the compressed bundle
#pem file is in $2
scp -i $1 $parent$release/$output  ubuntu@$2:/home/ubuntu/ # send it to instance in $1
#########
# HERE DOCUMENT THAT CREATES C3PO.SH
######
pidmongo="\$(pidof mongod)"
cat << EOF > c3po.sh # create c3po.sh dynamically with bundle file and instance url in $1
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
until pids=$pidmongo # Wait for mongo to start
do
    sleep 1
done
sudo apt-get install gcc make git libpcap0.8-dev
git clone https://github.com/jbittel/httpry.git
cd httpry
make
sudo make install
cd ~
tar -xvzf $output
cd bundle/programs/server
npm install
cd ../../
#export MONGO_URL="mongodb://localhost:27017/data"
#export PORT=3333
#export ROOT_URL="http://$2"
sudo useradd -r -m -s /bin/false c3po #System user: no login to reduce hacking exposure. It has home to run foreve package
#exit 0;
sudo -H -u c3po bash -c 'export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://$2" ; forever start main.js &'
#export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://$2" ; forever start main.js &
EOF
cat << EOF > c3po_debug.sh # Script to launch in debug mode
cd ~/bundle
sudo killall node
sudo killall nodejs
sudo -H -u c3po bash -c 'export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://$2" ; node-debug --cli main.js &'
EOF
#######
# END OF HERE DOCUMENTS
####
scp -i $1 c3po.sh  ubuntu@$2:/home/ubuntu/ # send to instance
scp -i $1 c3po_debug.sh  ubuntu@$2:/home/ubuntu/ # send to instance
ssh -i $1 ubuntu@$2 #login to instance
