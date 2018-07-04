var crypto = require("crypto");
module.exports = function (pw) {
	var md5 = crypto.createHash('md5');
	var password = md5.update(pw).digest('base64');
	return password;
}