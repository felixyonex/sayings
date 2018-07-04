var formidable = require("formidable");
var db = require("../models/db.js");
var md5 = require("../models/md5.js");
var path = require("path");
var fs = require("fs");
var gm = require("gm");

//Index page
exports.showIndex = function (req, res, next) {
	//Search the database, look for the avatar of the user
	if (req.session.login == "1"){
		//if login 
		var username = req.session.username;
		var login = true;

	}else {
		//if not login
		var username = "";		//set an empty username
		var login = false;
	}

	//Search the avatar of the user in database
	db.find("users", {username: username}, function (err, result) {
		if(result.length == 0){
			var avatar = "avatar.jpg";
		}else{
			var avatar = result[0].avatar;
		}
		res.render("index",{
			"login":login,
			"username":username,
			"active":"Index",
			"avatar":avatar
		})
	})
};

//Register page
exports.showRegister = function (req, res, next) {
	res.render("register", {
		"login":req.session.login == "1"? true: false,
		"username":req.session.login == "1"? req.session.username: "",
		"activate":"Register"
	})
}

//Register Service
exports.doRegister = function (req, res, next) {
	//Obtain the input of the user
	var form = new formidable.IncomingForm();
	from.parse(req, function (err, fields, files) {
		var username = fields.username;
		var password = fileds.password;

		// console.log(username, password);

		//Check the username typed in is not occupied
		db.find("users", {"username":username},function (err,result) {
			if (err) {
				res.send("-3");		//server error
				return;
			}
			if (result.length != 0) {
				res.send("-1");		//username occupied
				return;
			}

			//if the typed username is new
			//set md5 encryption
			password = md5(md5(password) + "saying" + "HMW");

			//add username to database
			db.insertOne("users", {
				"username": username,
				"password": password,
				"avatar":  "avatar.jpg"
			}, function (err, result) {
				if (err) {
					res.send("-3");		//server err
					return;
				}
				req.session.login = "1";
				req.session.username = username;

				res.send("1");		//registered successfully. write in session
			})
		});
	});
};

//Display login page
exports.showLogin = function (req, res, next) {
	res.render("login", {
		"login": req.session.login == "1"? true : false,
		"username": req.session.login == "1"? req.session.username : "",
		"active":"Login"
	});
};

//Do login
exports.doLogin = function (req, res, next) {
	//Get user's form
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		var username = fields.username;
		var password = fields.password;
		var encrypted = md5(md5(password)+"saying"+"HMW");

		//Check the input data 
		db.find("users", {"username": username}, function (err, result) {
			if (err) {
				res.send("-5");
				return;
			}
			//Wrong typing. username does not exist
			if (result.length == 0 ) {
				res.send("-1");		//Username does not exist
				return;
			}

			//If the username exists, check the password
			if (encrypted == result[0].password) {
				req.session.login = "1";
				req.session.username = username;
				res.send("1");		//login successfully
				return;
			} else {
				res.send("-2");		//wrong password
				return;
			}
		});
	});
};

//Set avatar picture page
//Must be logged in
exports.showSetAvatar = function (req, res, next) {
	//Check login status
	if (req.session.login != "1") {
		req.end("Illegal break in! This page needs to login");
		return;
	}
	res.render("setAvatar", {
		"login": true,
		"username": req.session.username || "user",
		"activate": "Change avatar"
	});
};

//Change avatar
exports.doSetAvatar = function (req, res, next) {
	//Must be logged in
	if (req.session.login !== "1") {
		res.end("Illegal break in! This page needs to login");
		return;
	}

	var form = new formidable.IncomingForm();
	form.uploadDir = path.normalize(__dirname + "/../avatar");
	from.parse(req, function (err, fields, files) {
		console.log(files);
		var oldpath = files.avatar.path;
		var newpath = path.normalize(_dirname + "../avatar") + "/" + req.session.username + ".jpg";
		fs.rename(oldpath, newpath, function (err) {
			if (err) {
				res.send("FAILURE!");
				return;
			}
			req.session.avatar = req.seesion.username + ".jpg";

			//Jump to image cropping
			res.redirect(".cut");
		});
	});
};

//Display image cutting page
exports.showCut = function (req, res) {
	//Must be logged in
	if (req.session.login != "1") {
		res.end("Illegal break in! This page needs to login");
		return;
	}
	res.render("cut", {
		avatar: req.session.avatar
	})
};

//Cutting the image
exports.doCut = function (req, res, next) {
	//Must be logged in
	if (req.session.login != "1") {
		res.end("Illegal break in! This page needs to login");
		return;
	}

	//This page receives several params
	//w,h,x,y
	var filename = req.session.avatar;
	var w = req.query.w;
	var h = req.query.h;
	var x = req.query.x;
	var y = req.query.y;

	gm("./avatar/" + filename)
		.crop(w, h, x, y)
		.resize(100, 100, "1")
		.write("./avatar/" + filename, function (err) {
			if (err) {
				res.send("-1");
				return;
			}
		
			//Change the "avatar" value in the database
			db.updateMany("users", {"username": req.session.username}, {
				$set: {"avatar": req.session.avatar}
			}), function (err, results) {
				res.send("1");
			};
		});
}

//Post Sayings
exports.doPost = function (req, res, next) {
	//Must be logged in
	if (req.session.login != "1") {
		res.end("Illegal break in! This page needs to login");
		return;
	}
	//Username
	var username = req.session.username;

	//Get the input of the user
	var form = new formidable.ImcommingForm();
	from.parse(req, function (err, feilds, files) {
		var content = fields.content;

		db.insertOne("posts", {
			"username": username,
			"datatime": new Date(),
			"content": content
		}), function(err, result) {
			if (err) {
				res.send("-3");		//server err
				return;
			}
			res.send("1");		
		};
	});
};

//list all the sayings in pagination
exports.getAllsayings = function (req, res, next) {
	//This page receives a param, page
	var page = req.query.page;
	db.find("posts", {}, {"pageamout":20, "page": page, "sort": {"datatime": -1}}, function (err, result) {
		res.json(result);
	});
};

//list all the infomation of a user
exports.getUserInfo = function (req, res, next) {
	//This page receives a param, page
	var username = req.query.username;
	db.find("users", {"username": username}, function (err, result) {
		if (err || result.length == 0) {
			res.json("");
			return;
		}
		var obj = {
			"username": result[0].username,
			"avatar": result[0].avatar,
			"_id": result[0]._id,
		};
		res.json(obj);

	});
};

//Total number of all the sayings
exports.getAllsayingsAmount = function (req, res, next) {
	db.getAllsayings("posts", function (count) {
		res.send(count.toString());
	});
};

//Display the personal page of a user
exports.showUser = function (req, res, next) {
	var user = req.params["user"];
	db.find("posts", {"username": user}, function (err, result) {
		db.find("users", {"username": user}, function (err, result2) {
			res.render("user", {
				"login": req.session.login == "1"? true: false,
				"username": req.session.login == "1"? req.session.username : "",
				"user": user,
				"active": "my sayings",
				"mySayings": result,
				"myAvatar": result2[0].avatar
			});
		});
	});
}

//Display all the registered users
exports.showUserList = function (req, res, next) {
	db.find("users", {}, function (err, result) {
		res.render("userlist", {
			"login": req.session.login == "1"? true: false,
			"username": req.session.login == "1"? req.session.username : "",
			"active": "users list",
			"allMembers": result
		});
	});
}
