Wordlist-Generator-in-NodeJS
============================

Generate words in Node.js and save to MySQL

TODO: Remove hardcoded value to the refrence table
### USAGE

```
node ./wordlist.js --type 3 --min 8 --max 8 --username root --password <PASSWORD> --hostname localhost --table gigantor --database dict --wordlist_name lowercase_letters
```

```
node ./wordlist.js --help
usage: wordlist.js [-h] [-v] [-u USERNAME] [-p PASSWORD] [-d HOSTNAME]
                   [-b DATABASE] [-e TABLE] [-t TYPE] [-n MIN] [-m MAX]
                   [--baz BAZ]


Argparse example

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -u USERNAME, --username USERNAME
                        MySQL Username
  -p PASSWORD, --password PASSWORD
                        MySQL Password
  -d HOSTNAME, --hostname HOSTNAME
                        MySQL Hostname
  -b DATABASE, --database DATABASE
                        Database name to use
  -e TABLE, --table TABLE
                        Database table to use for dictornary
  -t TYPE, --type TYPE  Charset to use. 1 - Numbers, 2 - Capital letters, 3 -
                        Lowercase letters, 4 - Numbers + capital letters, 5 -
                        Numbers + lowercase letters, 6 - Numbers + capital
                        letters + lowercase letters, 7 - Capital letters +
                        lowercase letters
  -n MIN, --min MIN     Minimum word length to generate
  -m MAX, --max MAX     Maximum wor d length to generate
```

### Tables
How I created my tables

```
 CREATE TABLE `dict`.`all_wordlists` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `wordlist_id` int(11) NOT NULL,
   `word_id` int(11) NOT NULL,
   PRIMARY KEY (`id`,`wordlist_id`,`word_id`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=16
 
  CREATE TABLE `dict`.`wordlists` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `wordlist_name` varchar(45) NOT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `wordlist_name_UNIQUE` (`wordlist_name`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=16
 
 CREATE TABLE `dict`.`gigantor` (
   `id` int(11) NOT NULL AUTO_INCREMENT,
   `word` varchar(65) NOT NULL,
   PRIMARY KEY (`id`),
   UNIQUE KEY `word` (`word`)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8 ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=16
```
