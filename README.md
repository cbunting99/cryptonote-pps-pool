sudo apt-get install build-essential libboost-all-dev -y
sudo apt-get install libsodium-dev libgmp3-dev node-gyp libssl-dev -y

sudo apt-get update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.profile
nvm install 12.22.6
sudo apt-get install redis-server

git clone https://github.com/cbunting99/cryptonote-pps-pool.git pool
cd pool
npm update