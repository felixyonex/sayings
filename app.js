const express = require("express");
const app = express();
const router = require("./router/router.js");

const session = require('express-session');

//use session
app.use(session({
	secret:"keyboard cat",
	resave: false,
	saveUninitialized: true
}));

//template engine
app.set("view engine","ejs");
//static pages
app.use(express.static("./public"));
app.use("avatar",express.static("./avatar"));
//router list
app.get("/",router.showIndex);		//Display index page
app.get("/register",router.showRegister);		//Display register page
app.post("/doRegister",router.doRegister);		//Offer register service & ajax
app.get("/login",router.showLogin);			//Display login page
app.post("/doLogin",router.doLogin);		//Offer login service & ajax
app.get("setAvatar",router.showSetAvatar);		// Display avatar setting page
app.post("/doSetAvatar",router.doSetAvatar);		//Offer avatar setting service & ajax
app.get("cut",router.showCut);		//Display avatar
app.post("/post",router.doPost);		//Offer sayings posting service
app.get("/docut",router.doCut);			//Offer image cutting service
app.get("/getAllsayings",router.getAllsayings);			//Offer all the sayings
app.get("/getUserInfo",router.getUserInfo);	
app.get("/getAllsayingsAmount",router.getAllsayingsAmount);
app.get("/user/:user",router.showUser);			//Show all the sayings of the current user
app.get("/post/:oid",router.showUser);			//Show all the sayings of all the users
app.get("/userlist",router.showUserList);			//Show all the users

app.listen(3000);

