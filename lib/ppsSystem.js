var fs = require('fs');

var async = require('async');

var logSystem = 'pps';
require('./exceptionWriter.js')(logSystem);


log('info', logSystem, 'Started');


function runInterval(){
    async.waterfall([

        //Get all good shares
        function(callback){
            redisClient.hgetall(config.coin + ':shares:good', function(error, result) {
                if (error) {
                    log('error', logSystem, 'Error trying to get worker good shares from redis %j', [error]);
                    callback(true);
                    return;
                }
                callback(null, result);
            });
        },

        function(shares, callback){
            redisClient.hgetall(config.coin + ':shares:good:total', function(error, result) {
                if (error) {
                    log('error', logSystem, 'Error trying to get worker total good shares from redis %j', [error]);
                    callback(true);
                    return;
                }
                callback(null, shares, result);
            });
        },
	
    	function(shares, totals, callback){

    		if(config.poolServer.type == "pps"){

	    		for(worker in shares){

    				var redisCommands = [];
    			
				    var pShare = 0;
				    var pShareNoBonus = 0;
				    var hasBalance = false;

				    if(shares[worker] >= 1){
				    	hasBalance = true;

				    	pShare = parseInt(shares[worker] / 1) * 1;
				    	pShareNoBonus = pShare;					    
					    var total = totals[worker];

				    	pShare * config.poolServer.ppsReward;

				    	redisCommands.push(['hincrbyfloat', config.coin + ':shares:good', worker, -pShareNoBonus]);
				    	redisCommands.push(['hincrby', config.coin + ':workers:' + worker, 'balance', pShare*config.coinUnits]);

				    }// end if shares[worker] >= 1

		    		redisClient.multi(redisCommands).exec(function(err, replies){
				        if (err){
				            log('error', logSystem, 'PPS failed to update stats for %s', [worker]);
                    		callback(true);
				            return;
				        }
				        if(hasBalance){
				        	log('info', logSystem, '%d balance has been added to %s for %d good shares', [pShare*config.coinUnits, worker, pShareNoBonus]);
				        }

				    });

	    		} //end for()

	    	} //end if pps

	    	callback(null, totals);

	    },

	    function(totals, callback){
	    	if(config.poolServer.type == "pps"){

	    		for(worker in totals){

    				var redisCommands = [];

				    var tShare = 0;
				    var tShareNoBonus = 0;
				    var pBonus = 0;
				    var isBonus = false;

				    if(totals[worker] >= 1000){
				    	isBonus = true;

				    	tShare = parseInt(totals[worker] / 1000) * 1000;
				    	tShareNoBonus = tShare;

					    if(config.poolServer.bonusChance <= Math.floor(Math.random() * (1 - 1000) + 1)){
						    pBonus = (tShare * config.poolServer.bonusReward);

						    redisCommands.push(['hincrbyfloat', config.coin + ':shares:good:total', worker, -tShareNoBonus]);
				    		redisCommands.push(['hincrby', config.coin + ':workers:' + worker, 'balance', pBonus*config.coinUnits]);
						}				    	

				    }// end if totals[worker] >= 1000

		    		redisClient.multi(redisCommands).exec(function(err, replies){
				        if (err){
				            log('error', logSystem, 'PPS failed to update stats for %s', [worker]);
                    		callback(true);
				            return;
				        }
				        if(isBonus){
				        	log('info', logSystem, '%d balance has been added to %s as bonus', [pBonus*config.coinUnits, worker]);
				        }
				    });

	    		} //end for()

	    	} //end if pps
	    	callback(null)
	    }

    ], function(error, result){
        setTimeout(runInterval, config.poolServer.ppsInterval * 1000);
    });
}

runInterval();

