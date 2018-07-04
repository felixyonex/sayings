//This module contains all the common operations of the database

var MongoClient = require("mongodb").MongoClient;
var settings = require("../settings.js");

//Before any operation, database should be connected first.
//So we package it as a function
function _connectDB(callback){
	var url = settings.dburl;	//从settings文件中获取数据库地址
	//连接数据库
	MongoClient.connect(url, function (err,db) {
		if (err) {
			callback(err,null);
			return;
		}
		callback(err, db);
	});
}

init();

function init(){
	//Initiate the database
	_connectDB(function (err,db) {
		if (err){
			console.log(err);
			return;
		}
		db.collection('users').createIndex(
			{"users":1},
			null,
			function (err, results) {
				if (err){
					console.log(err);
					return;
				}
				console.log("Index created sucessfully!");
			}
		);
			
	});
}

//Insert data
exports.insertOne = function (collectionName, json, callback) {
	_connectDB(function (err,db) {
		db.collection(collectionName).insertOne(json,function (err,result) {
			callback(err,result);
			db.close();		//close the database
		})
	})
}

//Search data, find all the required data. args is an object{"pageamout":10,"page":10}
exports.find = function (collectionName, json, C, D) {
	var result = [];		//result array
	if (arguments.length == 3) {
		//so C is the callback, No D
		var callback = C;
		var skipNumber = 0;
		//number limit
		var limit = 0;

	}else if (argument.length == 4) {
		var callback = D;
		var args = C;
		//the skip number of the search result
		var skipNumber = args.pageamout * args.page || 0;
		//the number limit of the search result
		var limit = args.pageamout || 0;
		//ranking order
		var sort = args.sort || {};
	} else {
		throw new Error("The arguments of the find function must be 3 or 4!");
		return;
	}

	//connect to the database, and then search
	_connectDB(function(err, db){
		var cursor = db.collection(collectionName).find(json).skip(skipNumber).limit(limit).sort(sort);
		cursor.each(function(err, doc) {
			if (err) {
				callback(err, null);
				db.close();
				return;
			}
			if (doc != null){
				result.push(doc);	//put doc into result array
			} else {
				//loop ends, no more docs
				callback (null, result);
				db.close();
			}
		});
	});

}

//delete
exports.deleteMany = function (collectionName,json, callback) {
	_connectDB(function (err,db) {
		//delete
		db.collection(collectionName).deletMany(
			json,
			function (err,results) {
				callback(err,results);
				db.close();
			})
	})
}

//modify
exports.updataMany = function (collecitonName,json1,json2,callback) {
	_connectDB(function (err,db) {
		db.colletion(collectionName).updateMany(
			json1,
			json2,
			function (err,results) {
				callback(err,results);
				db.close();
			})
	})
}

//Get total number
exports.getAllCount = function (collectionName,callback) {
	_connectDB(function (err,db) {
		db.collectionName(collectionName).count({}).then(function(count){
			callback(count);
			db.close();
		});
	})
}