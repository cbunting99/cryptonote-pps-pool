var fs = require('fs');

var async = require('async');

var logSystem = 'pps';
require('./exceptionWriter.js')(logSystem);


log('info', logSystem, 'Started');


function runInterval(){
    async.waterfall([

        //Get worker keys
        function(callback){
            redisClient.keys(config.coin + ':workers:*', function(error, result) {
                if (error) {
                    log('error', logSystem, 'Error trying to get worker balances from redis %j', [error]);
                    callback(true);
                    return;
                }
                callback(null, result);
            });
        },
	
    	function(keys, callback){
    	    var redisCommands = keys.map(function(k){
                return ['hget', k, 'balance'];
            });
            redisClient.multi(redisCommands).exec(function(error, replies){
	            if (error){
	                log('error', logSystem, 'Error with getting balances from redis %j', [error]);
	                callback(true);
	                return;
	            }
		    	if(config.poolServer.type == "pps"){
				    for (var i = 0; i < replies.length; i++){
				    	var parts = keys[i].split(':');
				    	var worker = parts[parts.length - 1];
				    	redisClient.hget(config.coin + ':shares:good', worker, function(error, result){
						    if (error){
						    	log('error', logSystem, 'Error with getting good share for %s', [worker]);
						    	callback(true);
						    	return;
						    }
						    var pShare = 0;
						    var pShareNoBonus = 0;
						    if(result >= 1000){
						    	pShare = parseInt(result / 1000) * 1000;
						    	if(config.poolServer.bonusChance <= Math.floor(Math.random() * (1 - 100) + 1)){
								    pShareNoBonus = pShare;
								    pShare += (pShare * config.poolServer.bonusReward);
								}else{
									pShare *= config.poolServer.ppsReward;
								}
						    }
						    redisClient.hincrby(config.coin + 'shares:good', worker, -1000 * pShareNoBonus);
						    redisClient.hincrby(config.coin + ':workers:' + worker, 'balance', pShare*config.coinUnits);
				    	});
				    }
	            }
            });
            callback(null);
	    }

    ], function(error, result){
        setTimeout(runInterval, config.pps.interval * 1000);
    });
}

runInterval();
