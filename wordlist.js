var fs   = require('fs'),
	argv   = require('optimist').argv,
    _    = require('underscore'),
    file = 'wordlist.txt',
    stream = fs.createWriteStream(file, {flags: 'w'});

// Numbers = 48 - 57
// Capital = 65 - 90
// Lower = 97 - 122

var charsBuffer  = [],
	numbers      = _.range(48, 58),
	alfalow      = _.range(97,123),
	alfacap      = _.range(65,91);

switch(argv.type){
	case 1:  charsBuffer = numbers; break;
	case 2:  charsBuffer = alfacap; break;
	case 3:  charsBuffer = alfalow; break;
	case 4:  charsBuffer = _.union(numbers,alfacap); break;
	case 5:  charsBuffer = _.union(numbers,alfalow); break;
	case 6:  charsBuffer = _.union(numbers,alfalow,alfacap); break;
	case 7:  charsBuffer = _.union(alfalow,alfacap); break;
	default:
		console.log(""+
			"Invalid options, please chose a type number between 1 to 7. \nEx: node wordlist.js --type 1 --min 1 --max 10\n"+
			"1) Numbers\n"+
    		"2) Capital Letters\n"+
    		"3) Lowercase Letters\n"+
    		"4) Numbers + Capital Letters\n"+
    		"5) Numbers + Lowercase Letters\n"+
    		"6) Numbers + Capital Letters + Lowercase Letters\n"+
    		"7) Capital Letters + Lowercase Letters\n");
	process.exit(0);
}
var string = _.map(charsBuffer,function(dec) {
	return String.fromCharCode(dec);
}).join('');

if(!_.isNumber(argv.min) || !_.isNumber(argv.max) || argv.min <= 0 || argv.min > argv.max) {
	console.log("Invalid options, please chose valid values for min and max params. \nEx: node wordlist.js --type 1 --min 1 --max 10 ");
	process.exit(0);
}

/* permutations info */
var permutation = [],
	MIN  = argv.min,
	MAX  = argv.max+1,
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
function write() {
	nextPermutation(function(perm) { 
    count++;
    console.log(perm.join(''));
		if(typeof(perm) != 'object') { console.log('Time : ' + (microtime(true) - now) + ' / Total : ' + count); process.exit(0); }
		stream.write(perm.join('') + "\n", function() {
			write();
		});

    else
      setImmediate(write);
	});
}

write();
 

/*
1-5 numeric 111.110 permutari in 9.5 secunde + write / 0.90 secunde fara write
1-6 numeric 1.111.110 permutari in 96.3 secunde + write / 8.99 secunde fara write
1-7 numeric 11.111.110 permutari in 96.11 secunde fara write

1-3 toate 242235 fara write 2,3 secunde
1-4 toate 15.018.571 fara  write 152.2 secunde => 98.676/secunda

*/