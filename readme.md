NodeJS dependencies
  "dependencies": {
    "body-parser": "^1.15.0",
    "express": "^4.13.4",
    "mongous": "^0.2.7",
    "nodemon": "^1.9.1",
    "request": "^2.71.0"
  }

Setting up NodeJS
1. in vagrant ssh:
	From the /shared/whatShouldIPlay directory (cd /shared/whatShouldIPlay)
	1. npm install body-parser --save
	2. npm install express --save
	3. npm install mongous --save
	4. npm install nodemon --save
	5. npm install request --save

Running MongoDB
1. in vagrant ssh:
	a. type: mkdir -p ./mongodb/data
	b. type: ./mongodb/bin/mongod --dbpath=$HOME/mongodb/data

