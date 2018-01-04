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
						    	log('error', logSystem, 'Error with getting good shares for %s', [worker]);
						    	callback(true);
						    	return;
						    }
						    var pShare = 0;
						    var pShareNoBonus = 0;
						    if(result >= 1000){
						    	pShare = parseInt(result / 1000) * 1000;
							    pShareNoBonus = pShare;
						    	if(config.poolServer.bonusChance <= Math.floor(Math.random() * (1 - 100) + 1)){
								    pShare = pShare + (pShare * config.poolServer.bonusReward);
								}else{
									pShare = pShare * config.poolServer.ppsReward;
								}
							    redisClient.hincrbyfloat(config.coin + ':shares:good', worker, -pShareNoBonus, function(error, result){
							    	if (error){
								    	log('error', logSystem, 'Error updating good shares for %s: %s', [worker, error]);
								    	callback(true);
								    	return;
								    }
								    log('info', logSystem, '%d good shares has been removed to worker %s', [pShareNoBonus, worker]);
								    redisClient.hincrby(config.coin + ':workers:' + worker, 'balance', pShare*config.coinUnits, function(error, result){
							    		if (error){
									    	log('error', logSystem, 'Error updating balance for %s', [worker]);
									    	callback(true);
									    	return;
									    }
								    	log('info', logSystem, '%d balance has been added to worker %s', [pShare*config.coinUnits, worker]);
								    });
							    });
						    }
				    	});
				    }
	            }
            });
            callback(null);
	    }

    ], function(error, result){
        setTimeout(runInterval, config.poolServer.ppsInterval * 1000);
    });
}

runInterval();

