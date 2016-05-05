# **What Should I Play?** #
*CPSC 473 Project* 


- Burton Skyler Lister Aley 


- Seonghyeon Lim


- Brendon Kyle Hollingsworth


- Michelle Nicole Beck


- Chengcheng Zhu

----------

## NodeJS dependencies ##
  "dependencies": {
    

- "body-parser": "^1.15.0",
    

- "express": "^4.13.4",
    

- "mongous": "^0.2.7",
    

- "nodemon": "^1.9.1",
    

- "request": "^2.71.0"
  
}

----------

## Setting up NodeJS  ##
1. from command prompt type: vagrant ssh
2. (From the /shared/whatShouldIPlay directory) `cd /shared/WhatShouldIPlay`

> 	1. npm install body-parser --save
> 	2. npm install express --save
> 	3. npm install mongojs --save
> 	4. npm install nodemon --save
> 	5. npm install request --save

----------

#Launching "What Should I Play" App#

## Running MongoDB ##
1. type: vagrant ssh:

> 	1. type: mkdir -p ./mongodb/data 
> 	2. type: ./mongodb/bin/mongod --dbpath=$HOME/mongodb/data

----------

## Setting up MongoDB ##
1. Once MongoDB is running. type: vagrant ssh:
2. (From the /home/vagrant/mongodb/bin directory) `cd /home/vagrant/mongodb/bin`

>   1. type: mongo
>	2. type: use wsip
>   3. type: db.dropDatabase()
> 	3. type: ./mongorestore -d wsip /home/vagrant/shared/WhatShouldIPlay/wsip/

## Backing up current MongoDB ##
1. type: vagrant ssh:
2. (From the /home/vagrant/mongodb/bin directory) `cd /home/vagrant/mongodb/bin`

> 	1. type: ./mongodump -d wsip -o /home/vagrant/shared/WhatShouldIPlay/

## Running Nodemon ##
1. type: vagrant ssh:

> 1. type: cd shared/WhatShouldIPlay
> 2. type: nodemon

## Viewing The Website (After Setup) ##

Navigate to [http://localhost:3000/](http://localhost:3000/ "http://localhost:3000/")