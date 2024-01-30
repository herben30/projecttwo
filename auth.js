const jwt = require("jsonwebtoken");

const secret = `Pastry_E-Commerce_API`;

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	}

	return jwt.sign(data, secret, {});

}


// token verification
module.exports.verify = (request, response, next) => {
	let token = request.headers.authorization;
	

	if(token === undefined){
		return response.send("No token provided!")
	}else{
		token = token.slice(7, token.length);

		// Token decryption
		jwt.verify(token, secret, (err, decodedToken) => {
			if(err){
				return response.send({
					auth: "Failed",
					message: err.message
				})
			}else{

				request.user = decodedToken;
			
				next();
			}
		})

	}
}

// To check whether the user is admin or not
module.exports.verifyAdmin = (request, response, next) => {
	// condition to check whether the user is admin or not
	if(request.user.isAdmin){
		next();
	}else{
		return response.send({
			auth: "Failed",
			message: "Action Forbidden!"
		})
	}
}
