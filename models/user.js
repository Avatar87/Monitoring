const crypto = require('crypto');
const config = require('../config');
const {dbUrl} = config;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;

class User {
	constructor(id, username, password, isAdmin) {
		this.id = id;
		this.isAdmin = isAdmin;
		this.username = username;
		this.password = password;
	}

	static findOne(username){
		return new Promise((resolve, reject) => {
			MongoClient.connect(dbUrl, async function(err, db) {
				if (err) reject(err);
				var currentDB = db.db('monitoring');
				var user = await currentDB.collection('users').findOne({username});
				resolve(user);
			})
		})
	}

	static encryptPass(password){
		var mykey = crypto.createCipher('aes-128-cbc', 'mypassword');
		var mystr = mykey.update(password, 'utf8', 'hex')
		mystr += mykey.final('hex');
		return mystr;
	}
}

module.exports = User;
