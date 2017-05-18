cd ~/bundle
sudo killall node
sudo killall nodejs
sudo -H -u c3po bash -c 'export MONGO_URL="mongodb://localhost:27017/data" ; export PORT=3333 ; export ROOT_URL="http://107.21.53.136" ; node-debug --cli main.js &'
