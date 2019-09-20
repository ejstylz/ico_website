const User = require('../models/user');

module.exports = {
	asyncErrorHandler: (fn) => (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	},

	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) return next();
		// console.log('You need to be logged in to do that');
		req.session.redirectTo = req.originalUrl;
		req.session.error = "You need to be logged in to do that";
		res.redirect('/login');
	},

	checkIfUserExists: async (req, res, next) => {
		let emailExists = await User.findOne({ 'email': req.body.email });
		let usernameExists = await User.findOne({ 'username': req.body.username });
		if (emailExists) {
			req.session.error = "Email already exists";
			console.log('Email already exists');
			return res.redirect('back');
		}
		else if (usernameExists) {
			req.session.error = "Username already exists";
			console.log('Username already exists');
			return res.redirect('back');
		}
		next();
	},

	purchaseMiddleware: (req, res, next) => {
		let price = req.body.price;
		if (!price) {
			res.redirect("/buy")
		} else {
			next();
		}
	},

	isValidPassword: async (req, res, next) => {
		const { user } = await User.authenticate()(req.user.username, req.body.currentPassword);
		if (user) {
			// add user to res.locals
			res.locals.user = user;
			next();
		} else {
			req.session.error = "Incorrect Password";
			// console.log("Incorrect Password");
			return res.redirect('/profile');
		}
	},

	changePassword: async (req, res, next) => {
		const {
			newPassword,
			passwordConfirmation
		} = req.body;

		if (newPassword && passwordConfirmation) {
			const { user } = res.locals;
			if (newPassword === passwordConfirmation) {
				await user.setPassword(newPassword);
				next();
			} else {
				req.session.error = "The new passwords must match!";
				// console.log('The new passwords must match!');
				return res.redirect('/profile');
			}
		} else {
			next();
		}
	},

	checkAuthorization: (req, res, next) => {
		if (req.isAuthenticated()) {
			//does user own the campground?
			if (req.user.username === "Ronaldo" || req.user.username === "Admin") {
				next();
			} else {
				req.session.error = "You don't have permission to do that";
				// console.log("error", "You don't have permission to do that");
				res.redirect("/dashboard");
			}
		} else {
			req.session.redirectTo = req.originalUrl;
			req.session.error = "You need to be logged in to do that";
			// console.log("error", "You need to be logged in to do that");
			res.redirect("/login");
		}
	}
};
