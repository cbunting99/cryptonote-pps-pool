cryptonote-pps-pool
====================

High performance Node.js (with native C addons) mining pool for Cryptonote based coins, created with the Forknote software such as Bytecoin, Dashcoin, etc..

Comes with lightweight example front-end script which uses the pool's AJAX API.

#### Requirements

```
sudo apt-get install build-essential libtool autotools-dev automake pkg-config libssl-dev libevent-dev bsdmainutils python3
sudo apt-get install libboost-all-dev libzmq3-dev
sudo apt-get install php-mbstring php-zip zip
```

```
sudo apt-get update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.profile
nvm install 12.22.6
sudo apt-get install redis-server
```

#### 1) Downloading & Installing


Clone the repository and run `npm update` for all the dependencies to be installed:

```bash
git clone https://github.com/cbunting99/cryptonote-pps-pool.git pool
cd pool
npm update
```

#### 2) Configuration


Explanation for each field:
```javascript
/* Used for storage in redis so multiple coins can share the same redis instance. */
"coin": "graft",

/* Used for front-end display */
"symbol": "GRFT",

/* Minimum units in a single coin, see COIN constant in DAEMON_CODE/src/cryptonote_config.h */
"coinUnits": 1000000000000,

/* Coin network time to mine one block, see DIFFICULTY_TARGET constant in DAEMON_CODE/src/cryptonote_config.h */
"coinDifficultyTarget": 120,

"logging": {

    "files": {

        /* Specifies the level of log output verbosity. This level and anything
           more severe will be logged. Options are: info, warn, or error. */
        "level": "info",

        /* Directory where to write log files. */
        "directory": "logs",

        /* How often (in seconds) to append/flush data to the log files. */
        "flushInterval": 5
    },

    "console": {
        "level": "info",
        /* Gives console output useful colors. If you direct that output to a log file
           then disable this feature to avoid nasty characters in the file. */
        "colors": true
    }
},

/* Modular Pool Server */
"poolServer": {
    "enabled": true,

    /* Set to "auto" by default which will spawn one process/fork/worker for each CPU
       core in your system. Each of these workers will run a separate instance of your
       pool(s), and the kernel will load balance miners using these forks. Optionally,
       the 'forks' field can be a number for how many forks will be spawned. */
    "clusterForks": "auto",
    
    /* Set to "pps" to enable PPS system or "pplns" to disable PPS system. */
    "type": "pps",
    
    /* PPS Reward per good share. Good Share = Miner Difficulty or Static Difficulty / Share Difficulty */
    "ppsReward": 0.1,
    
    /* How often to update PPS stats */
    "ppsInterval": 60,
    
    /* Bonus reward for every 1000 good share */
    "bonusReward": 0.5,
    
    /* 1 to 1000/1000 chance to get the bonus reward for every 1000 good share */
    "bonusChance": 1,
    
    /* (Block Reward - Fee) * n = bonus received by block finder. 
    "blockFinderBonus": 0.01,

    /* Address where block rewards go, and miner payments come from. */
    "poolAddress": "D6WLtrV1SBWV8HWQzQv8uuYuGy3uwZ8ah5iT5HovSqhTKMauquoTsKP8RBJzVqVesX87poYWQgkGWB4NWHJ6Ravv93v4BaE"

    /* Poll RPC daemons for new blocks every this many milliseconds. */
    "blockRefreshInterval": 1000,

    /* How many seconds until we consider a miner disconnected. */
    "minerTimeout": 900,

    "ports": [
        {
            "port": 3333, //Port for mining apps to connect to
            "difficulty": 100, //Initial difficulty miners are set to
            "desc": "Low end hardware" //Description of port
        },
        {
            "port": 5555,
            "difficulty": 2000,
            "desc": "Mid range hardware"
        },
        {
            "port": 7777,
            "difficulty": 10000,
            "desc": "High end hardware"
        }
    ],

    /* Variable difficulty is a feature that will automatically adjust difficulty for
       individual miners based on their hashrate in order to lower networking and CPU
       overhead. */
    "varDiff": {
        "minDiff": 2, //Minimum difficulty
        "maxDiff": 100000,
        "targetTime": 100, //Try to get 1 share per this many seconds
        "retargetTime": 30, //Check to see if we should retarget every this many seconds
        "variancePercent": 30, //Allow time to very this % from target without retargeting
        "maxJump": 100 //Limit diff percent increase/decrease in a single retargetting
    },

    /* Set difficulty on miner client side by passing <address> param with .<difficulty> postfix
       minerd -u D3z2DDWygoZU4NniCNa4oMjjKi45dC2KHUWUyD1RZ1pfgnRgcHdfLVQgh5gmRv4jwEjCX5LoLERAf5PbjLS43Rkd8vFUM1m.5000 */
    "fixedDiff": {
        "enabled": true,
        "separator": ".", // character separator between <address> and <difficulty>
    },

    /* Feature to trust share difficulties from miners which can
       significantly reduce CPU load. */
    "shareTrust": {
        "enabled": true,
        "min": 10, //Minimum percent probability for share hashing
        "stepDown": 3, //Increase trust probability % this much with each valid share
        "threshold": 10, //Amount of valid shares required before trusting begins
        "penalty": 30 //Upon breaking trust require this many valid share before trusting
    },

    /* If under low-diff share attack we can ban their IP to reduce system/network load. */
    "banning": {
        "enabled": true,
        "time": 600, //How many seconds to ban worker for
        "invalidPercent": 25, //What percent of invalid shares triggers ban
        "checkThreshold": 30 //Perform check when this many shares have been submitted
    },
    /* Slush Mining is a reward calculation technique which disincentivizes pool hopping and rewards users to mine with the pool steadily: Values of each share decrease in time – younger shares are valued higher than older shares.
    More about it here: https://mining.bitcoin.cz/help/#!/manual/rewards */
    /* There is some bugs with enabled slushMining. Use with '"enabled": false' only. */

    "slushMining": {
        "enabled": false, // 'true' enables slush mining. Recommended for pools catering to professional miners
        "weight": 120, //defines how fast value assigned to a share declines in time
        "lastBlockCheckRate": 1 //How often the pool checks for the timestamp of the last block. Lower numbers increase load for the Redis db, but make the share value more precise.
    }
},

/* Module that sends payments to miners according to their submitted shares. */
"payments": {
    "enabled": true,
    "interval": 600, //how often to run in seconds
    "maxAddresses": 50, //split up payments if sending to more than this many addresses
    "mixin": 3, //number of transactions yours is indistinguishable from
    "transferFee": 5000000000, //fee to pay for each transaction
    "minPayment": 100000000000, //miner balance required before sending payment
    "maxTransactionAmount": 0, //split transactions by this amount(to prevent "too big transaction" error)
    "denomination": 100000000000 //truncate to this precision and store remainder
},

/* Module that monitors the submitted block maturities and manages rounds. Confirmed
   blocks mark the end of a round where workers' balances are increased in proportion
   to their shares. */
"blockUnlocker": {
    "enabled": true,
    "interval": 30, //how often to check block statuses in seconds

    /* Block depth required for a block to unlocked/mature. Found in daemon source as
       the variable CRYPTONOTE_MINED_MONEY_UNLOCK_WINDOW */
    "depth": 60,
    "poolFee": 1.8, //1.8% pool fee (2% total fee total including donations)
    "devDonation": 0.1, //0.1% donation to send to pool dev - only works with Monero
    "coreDevDonation": 0.1 //0.1% donation to send to core devs - works with Bytecoin, Monero, Dashcoin, QuarazCoin, Fantoncoin, AEON and OneEvilCoin
},

/* AJAX API used for front-end website. */
"api": {
    "enabled": true,
    "hashrateWindow": 600, //how many second worth of shares used to estimate hash rate
    "updateInterval": 3, //gather stats and broadcast every this many seconds
    "port": 8117,
    "blocks": 30, //amount of blocks to send at a time
    "payments": 30, //amount of payments to send at a time
    "password": "test" //password required for admin stats
},

/* Coin daemon connection details. */
"daemon": {
    "host": "127.0.0.1",
    "port": 18981
},

/* Wallet daemon connection details. */
"wallet": {
    "host": "127.0.0.1",
    "port": 18982
},

/* Redis connection into. */
"redis": {
    "host": "127.0.0.1",
    "port": 6379
}

/* Monitoring RPC services. Statistics will be displayed in Admin panel */
"monitoring": {
    "daemon": {
        "checkInterval": 60, //interval of sending rpcMethod request
        "rpcMethod": "getblockcount" //RPC method name
    },
    "wallet": {
        "checkInterval": 60,
        "rpcMethod": "get_address_count"
    }

/* Collect pool statistics to display in frontend charts  */
"charts": {
    "pool": {
        "hashrate": {
            "enabled": true, //enable data collection and chart displaying in frontend
            "updateInterval": 60, //how often to get current value
            "stepInterval": 1800, //chart step interval calculated as average of all updated values
            "maximumPeriod": 86400 //chart maximum periods (chart points number = maximumPeriod / stepInterval = 48)
        },
        "workers": {
            "enabled": true,
            "updateInterval": 60,
            "stepInterval": 1800, //chart step interval calculated as maximum of all updated values
            "maximumPeriod": 86400
        },
        "difficulty": {
            "enabled": true,
            "updateInterval": 1800,
            "stepInterval": 10800,
            "maximumPeriod": 604800
        },
        "price": { //USD price of one currency coin received from cryptonator.com/api
            "enabled": true,
            "updateInterval": 1800,
            "stepInterval": 10800,
            "maximumPeriod": 604800
        },
        "profit": { //Reward * Rate / Difficulty
            "enabled": true,
            "updateInterval": 1800,
            "stepInterval": 10800,
            "maximumPeriod": 604800
        }
    },
    "user": { //chart data displayed in user stats block
        "hashrate": {
            "enabled": true,
            "updateInterval": 180,
            "stepInterval": 1800,
            "maximumPeriod": 86400
        },
        "payments": { //payment chart uses all user payments data stored in DB
            "enabled": true
        }
    }
```

#### 3) [Optional] Configure cryptonote-easy-miner for your pool
Your miners that are Windows users can use [cryptonote-easy-miner](https://github.com/zone117x/cryptonote-easy-miner)
which will automatically generate their wallet address and stratup multiple threads of simpleminer. You can download
it and edit the `config.ini` file to point to your own pool.
Inside the `easyminer` folder, edit `config.init` to point to your pool details
```ini
pool_host=example.com
pool_port=5555
```

Rezip and upload to your server or a file host. Then change the `easyminerDownload` link in your `config.json` file to
point to your zip file.

#### 4) Start the pool

```bash
node init.js
```

The file `config.json` is used by default but a file can be specified using the `-config=file` command argument, for example:

```bash
node init.js -config=config_backup.json
```

This software contains four distinct modules:
* `pool` - Which opens ports for miners to connect and processes shares
* `api` - Used by the website to display network, pool and miners' data
* `unlocker` - Processes block candidates and increases miners' balances when blocks are unlocked
* `payments` - Sends out payments to miners according to their balances stored in redis


By default, running the `init.js` script will start up all four modules. You can optionally have the script start
only start a specific module by using the `-module=name` command argument, for example:

```bash
node init.js -module=api
```

[Example screenshot](http://i.imgur.com/SEgrI3b.png) of running the pool in single module mode with tmux.


#### 5) Host the front-end

Simply host the contents of the `website_example` directory on file server capable of serving simple static files.


Edit the variables in the `website_example/config.js` file to use your pool's specific configuration.
Variable explanations:

```javascript

/* Must point to the API setup in your config.json file. */
var api = "http://poolhost:8117";

/* Pool server host to instruct your miners to point to.  */
var poolHost = "poolhost.com";

/* IRC Server and room used for embedded KiwiIRC chat. */
var irc = "irc.freenode.net/#forknote";

/* Contact email address. */
var email = "support@poolhost.com";

/* Market stat display params from https://www.cryptonator.com/widget */
var cryptonatorWidget = ["DSH-BTC", "DSH-USD", "DSH-EUR"];

/* Download link to cryptonote-easy-miner for Windows users. */
var easyminerDownload = "https://github.com/zone117x/cryptonote-easy-miner/releases/";

/* Used for front-end block links. */
var blockchainExplorer = "http://chainradar.com/{symbol}/block/{id}";

/* Used by front-end transaction links. */
var transactionExplorer = "http://chainradar.com/{symbol}/transaction/{id}";

/* Any custom CSS theme for pool frontend */
var themeCss = "themes/default-theme.css";

```

#### 6) Customize your website

The following files are included so that you can customize your pool website without having to make significant changes
to `index.html` or other front-end files thus reducing the difficulty of merging updates with your own changes:
* `custom.css` for creating your own pool style
* `custom.js` for changing the functionality of your pool website


Then simply serve the files via nginx, Apache, Google Drive, or anything that can host static content.


#### Upgrading
When updating to the latest code its important to not only `git pull` the latest from this repo, but to also update
the Node.js modules, and any config files that may have been changed.
* Inside your pool directory (where the init.js script is) do `git pull` to get the latest code.
* Remove the dependencies by deleting the `node_modules` directory with `rm -r node_modules`.
* Run `npm update` to force updating/reinstalling of the dependencies.
* Compare your `config.json` to the latest example ones in this repo or the ones in the setup instructions where each config field is explained. You may need to modify or add any new changes.

### Setting up Testnet

No cryptonote based coins have a testnet mode (yet) but you can effectively create a testnet with the following steps:

* Open `/src/p2p/net_node.inl` and remove lines with `ADD_HARDCODED_SEED_NODE` to prevent it from connecting to mainnet (Monero example: http://git.io/0a12_Q)
* Build the coin from source
* You now need to run two instance of the daemon and connect them to each other (without a connection to another instance the daemon will not accept RPC requests)
  * Run first instance with `./forknoted --p2p-bind-port 28080 --allow-local-ip`
  * Run second instance with `./forknoted --p2p-bind-port 5011 --rpc-bind-port 5010 --add-peer 0.0.0.0:28080 --allow-local-ip`
* You should now have a local testnet setup. The ports can be changes as long as the second instance is pointed to the first instance, obviously

*Credit to surfer43 for these instructions*


### JSON-RPC Commands from CLI

Documentation for JSON-RPC commands can be found here:
* Daemon https://wiki.bytecoin.org/wiki/Daemon_JSON_RPC_API
* Wallet https://wiki.bytecoin.org/wiki/Bytecoin_RPC_Wallet_API


Curl can be used to use the JSON-RPC commands from command-line. Here is an example of calling `getblockheaderbyheight` for block 100:

```bash
curl 127.0.0.1:18081/json_rpc -d '{"method":"getblockheaderbyheight","params":{"height":100}}'
```


### Monitoring Your Pool

* To inspect and make changes to redis I suggest using [redis-commander](https://github.com/joeferner/redis-commander)
* To monitor server load for CPU, Network, IO, etc - I suggest using [New Relic](http://newrelic.com/)
* To keep your pool node script running in background, logging to file, and automatically restarting if it crashes - I suggest using [forever](https://github.com/nodejitsu/forever)


### Configuring Blockchain Explorer

You need the latest stable version of Forknote for the blockchain explorer - [forknote releases](https://github.com/forknote/forknote/releases)
* Add the following code to the coin's config file:

```
rpc-bind-ip=0.0.0.0
enable-blockchain-indexes=1
enable-cors=*
```

* Launch forknoted with the corresponding config file
* Change the following line in the pool's frontend config.json:

```
var api_blockexplorer = "http://daemonhost.com:1118";
```


Credits
===

* [LucasJones](//github.com/LucasJones) - Co-dev on this project; did tons of debugging for binary structures and fixing them. Pool couldn't have been made without him.
* [surfer43](//github.com/iamasupernova) - Did lots of testing during development to help figure out bugs and get them fixed
* [wallet42](http://moneropool.com) - Funded development of payment denominating and min threshold feature
* [Wolf0](https://bitcointalk.org/index.php?action=profile;u=80740) - Helped try to deobfuscate some of the daemon code for getting a bug fixed
* [Tacotime](https://bitcointalk.org/index.php?action=profile;u=19270) - helping with figuring out certain problems and lead the bounty for this project's creation
* [fancoder](https://github.com/fancoder/) - See his repo for the changes
* [p1vynodejs](https://github.com/p1vynodejs) - Added PPS system

License
-------
Released under the GNU General Public License v2

http://www.gnu.org/licenses/gpl-2.0.html
