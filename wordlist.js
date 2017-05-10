/*
  TODO: Remove hardcoded value to the refrence table
  USAGE: node ./wordlist.js --type 3 --min 8 --max 8 --username root --password <PASSWORD> --hostname <HOSTNAME> --table <TABLE> --database <DATABASE>
*/

var  _    = require('underscore');
const clear = require('clear-screen')
var chalk = require('chalk');
var mysql=require('mysql');
var Spinner = require('cli-spinner').Spinner;
Spinner.setDefaultSpinnerDelay(500);
var spinner = new Spinner('processing.. %s');
var ArgumentParser = require('argparse').ArgumentParser;

// Numbers = 48 - 57
// Capital = 65 - 90
// Lower = 97 - 122

var charsBuffer  = [],
	numbers      = _.range(48, 58),
	alfalow      = _.range(97,123),
	alfacap      = _.range(65,91);

var parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});

var db = {
    username: null,
    password: null,
    hostname: null,
    database: null,
	table:    null
};

var minLen;
var maxLen;

var connectionPool;

var createConnectionPool = function() {
	clear();
    return new Promise(function(fulfill, reject) {
        try {
            fulfill(mysql.createPool({
                connectionLimit : 100,
                host     : db.hostname,
                user     : db.username,
                password : db.password,
                database : db.database,
                debug    :  false
            }));
        }catch(err){
            reject(err);
        }
    });
};

var crud = {
    insertWord: function(listid, word){
		    return new Promise(function(fulfill, reject) {
        try {
			connectionPool.query("insert ignore into "+db.database+"."+db.table+" VALUES (null,"+listid+",\""+word+"\")",function(err,result,fields){
                if(err)
                    reject(err);
                else
                    fulfill(result.insertId);
            });
        }catch(err){
            reject(err);
        }
    });
    },
	checkIfWordlistExists: function(wordlistName) {
		return new Promise(function(fulfill, reject) {
			try {
				connectionPool.query("SELECT EXISTS(SELECT * FROM wordlists WHERE wordlists.wordlist_name = \""+wordlistName+"\")",function(err,result,fields){
					var t = '' + JSON.stringify(result);
			
					if(err)
						reject(err)
					else
						fulfill(t[t.length-3]);
				});
			}catch(err){
				reject(err);
			}
		});
	},
	createNewWordlist: function(wordlistName) {
				return new Promise(function(fulfill, reject) {
			try {
				connectionPool.query("INSERT INTO wordlists (`wordlist_name`) VALUES ('"+wordlistName+"')",function(err,result,fields){			
					if(err)
						reject(err)
					else
						fulfill(result.insertId);
				});
			}catch(err){
				reject(err);
			}
		});
	},
	getListId: function(wordlistName) {
			return new Promise(function(fulfill, reject) {
			try {
				connectionPool.query("SELECT id from wordlists where wordlist_name = '"+wordlistName+"'",function(err,result,fields){			
					if(err)
						reject(err)
					else
						fulfill(result[0].id);
				});
			}catch(err){
				reject(err);
			}
		});
	},
	createAssoc: function(listId, wordId) {
			return new Promise(function(fulfill, reject) {
			try {
				connectionPool.query("INSERT INTO `all_wordlists` (`wordlist_id`, `word_id`) VALUES ('"+listId+"', '"+wordId+"');",function(err,result,fields){			
					if(err)
						reject(err)
					else
						fulfill('Success');
				});
			}catch(err){
				reject(err);
			}
		});
	}
};

parser.addArgument(
  [ '-u', '--username' ],
  {
    help: 'MySQL Username'
  }
);

parser.addArgument(
  [ '-p', '--password' ],
  {
    help: 'MySQL Password'
  }
);

parser.addArgument(
  [ '-d', '--hostname' ],
  {
    help: 'MySQL Hostname'
  }
);

parser.addArgument(
  [ '-b', '--database' ],
  {
    help: 'Database name to use'
  }
);

parser.addArgument(
  [ '-e', '--table' ],
  {
    help: 'Database table to use for dictornary'
  }
);

parser.addArgument(
  [ '-w', '--wordlist_name' ],
  {
    help: 'What you\'d like to name your wordlist'
  }
);

parser.addArgument(
  [ '-t', '--type' ],
  {
    help: 'Charset to use.  1 - Numbers, 2 - Capital letters, 3 - Lowercase letters, 4 - Numbers + capital letters, 5 - Numbers + lowercase letters, 6 - Numbers + capital letters + lowercase letters, 7 - Capital letters + lowercase letters'
  }
);

parser.addArgument(
  [ '-n', '--min' ],
  {
    help: 'Minimum word length to generate'
  }
);

parser.addArgument(
  [ '-m', '--max' ],
  {
    help: 'Maximum wor d length to generate'
  }
);

parser.addArgument(
  '--baz',
  {
    help: 'baz bar'
  }
);

try {
	var args = parser.parseArgs();
	
	db.username = args.username;
	db.password = args.password;
	db.hostname = args.hostname;
	db.database = args.database;
	db.table    = args.table;
	
	switch(args.type){
		case '1':  charsBuffer = numbers; break;
		case '2':  charsBuffer = alfacap; break;
		case '3':  charsBuffer = alfalow; console.log(charsBuffer);break;
		case '4':  charsBuffer = _.union(numbers,alfacap); break;
		case '5':  charsBuffer = _.union(numbers,alfalow); break;
		case '6':  charsBuffer = _.union(numbers,alfalow,alfacap); break;
		case '7':  charsBuffer = _.union(alfalow,alfacap); break;
	}
	var string = _.map(charsBuffer,function(dec) {
		return String.fromCharCode(dec);
	}).join('');

	minLen = args.min;
	maxLen = args.max;
	
	createConnectionPool().then(function(pool) {
		console.log('Connection pool created');
		connectionPool = pool;

		crud.checkIfWordlistExists(args.wordlist_name).then(function(listExists) {
			if(listExists === '0') {
				console.log("Creating");
				crud.createNewWordlist(args.wordlist_name).then(function(wordlistId) {
					spinner.setSpinnerString('|/-\\');
					spinner.setSpinnerTitle('Generating....');
					spinner.start();
					console.log('Starting conneciton pool');
					write(wordlistId);
				},function(err) {
					console.log(chalk.red(err));
				});
			}else{
				console.log("Running");
				crud.getListId(args.wordlist_name).then(function(wordlistId) {
					spinner.setSpinnerString('|/-\\');
					spinner.setSpinnerTitle('Generating....');
					spinner.start();
					console.log('Starting conneciton pool');
					write(wordlistId);
				},function(err) {
					console.log(chalk.red(err));
				});				
			}
		},function(err){
			console.log(chalk.red(err));
		});
	},function(err) {
		console.log('Error:' + err);
	});	
	}catch(ex){
		console.log(ex);
}
var args = parser.parseArgs();

/* permutations info */
var permutation = [],
	MIN  = minLen,
	MAX  = maxLen+1,
	last = _.last(string),
	len  = 0;

function setChar(curr,callback) {
	if(curr >= 0) //daca pozitia curenta in permutare exista
   	{
   		if(permutation[curr] != last) //si nu am generat ultima permutare pentru pozitia curenta
   		{
        //console.log(string + ' ' + permutation[curr]);
   			permutation[curr] = string[_.indexOf(string,permutation[curr])+1]; // o generam pe urmatoarea si o afisam
   			//console.log("#1 " + len);
   			callback(permutation);
   		}
   		else // in caz contrar resetam pozitia curenta, coboram o pozitie si facem incrementare daca e posibil
   		{
   			permutation[curr] = string[0];
   			setChar(curr-1, callback);
   		}
   	}
   	else //daca nu ori avansam lungimea permutarii daca nu am depasit max ori WTF?!
   	{
   		len++;
   		if(len < MAX) //avansam o pozitie in dimensiunea permutarilor
   		{
   			permutation[len-1] = string[0];
   			//console.log("#2 " + len);
   			callback(permutation);
   		}
   		else
   			callback(true); //am terminat de generat toate variantele
   	}
}

function nextPermutation(callback) {
    if(len < MIN)//generam prima permutare
    {
    	for(i=0;i<MIN;i++)
    		permutation[i] = string[0];
    	len = MIN;
    	//console.log("#3 " + len);
    	callback(permutation);
    }
    else //cautam permutarea urmatoare
   	{ 
   		setChar(len-1, callback);
   	}	 
}

function microtime (get_as_float) {
    // Returns either a string or a float containing the current time in seconds and microseconds  
    // 
    // version: 1109.2015
    // discuss at: http://phpjs.org/functions/microtime
    // +   original by: Paulo Freitas
    // *     example 1: timeStamp = microtime(true);
    // *     results 1: timeStamp > 1000000000 && timeStamp < 2000000000
    var now = new Date().getTime() / 1000;
    var s = parseInt(now, 10);

    return (get_as_float) ? now : (Math.round((now - s) * 1000) / 1000) + ' ' + s;
}

var now = microtime(true);
var count = 0;
var id = 1;
function write(listid) {
	nextPermutation(function(perm) {
		count++;
		//console.log(perm.join(''));
		
		spinner.setSpinnerTitle('Everything is OK, generating words, this make take a while....');
		crud.insertWord(id, perm.join('')).then(function(newWordId) {
			crud.createAssoc(listid, newWordId).then(function(result) {
				write(listid);
			},function(err){
				console.log(chalk.red(err));
			});
		},function(err){
			console.log(chalk.red(err));
		});
		if(typeof(perm) != 'object') {
			//console.log('Time : ' + (microtime(true) - now) + ' / Total : ' + count); process.exit(0);
		}
	});
}
