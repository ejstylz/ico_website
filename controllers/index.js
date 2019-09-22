const User = require('../models/user');
const passport = require('passport');
const request = require('request');
const util = require('util');
const Coinpayments = require("coinpayments");
const crypto = require('crypto');
const sgMail = require('@sendgrid/mail');
const url = require('url');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const client = new Coinpayments({
	key: process.env.COINPAYMENTS_KEY,
	secret: process.env.COINPAYMETS_SECRET
});


module.exports = {
	//GET /sign-up
	getSignup(req, res, next) {
		let referrer = req.query.referrer;
		res.render('sign-up', { title: 'Sign Up', referrer });
	},

	//POST /sign-up
	async postRegister(req, res, next) {
		const newUser = new User({
			username: req.body.username,
			email: req.body.email,
			idImage: req.body.image,
			tokenAddress: req.body.tokenAddress,
			referrer: req.body.referrer
		});

		let user = await User.register(newUser, req.body.password);
		req.login(user, function (err) {
			if (err) return next(err);
			req.session.success = "User Registered";
			res.redirect('/dashboard');
		});
	},

	//GET /login
	getLogin(req, res, next) {
		res.render('login', { title: 'Clevebet Login' });
	},

	//POST /login
	async postLogin(req, res, next) {
		const { username, password } = req.body;
		const { user, error } = await User.authenticate()(username, password);
		if (!user && error) return next(error);
		req.login(user, function (err) {
			if (err) return next(err);
			req.session.success = "Welcome back!";
			console.log("Welcome back!");
			const redirectUrl = req.session.redirectTo || '/dashboard';
			delete req.session.redirectTo;
			res.redirect(redirectUrl);
			// passport.authenticate('local', {
			// 	successRedirect: '/dashboard',
			// 	failureRedirect: '/login'
			// })(req, res, next);
		});
	},

	//GET /dashboard
	getDashboard(req, res, next) {
		request('https://api.coingecko.com/api/v3/coins/', function (error, response, body) {
			if (!error && response.statusCode == 200) {
				var results = JSON.parse(body);
				var btcPrice = results[0]['market_data']['current_price']['usd'];
				var ethPrice = results[1]['market_data']['current_price']['usd'];
				var ltcPrice = results[4]['market_data']['current_price']['usd'];
				// console.log(btcPrice);
			}
			res.render('Dashboard/index', { title: 'Clevebet Login', btcPrice, ltcPrice, ethPrice });
		});
	},

	//GET /referral-list
	getReferralList(req, res, next) {
		const user = req.user;
		User.find({ referrer: user._id }, function (err, users) {
			if (err) {
				console.log(err)
			} else {
				res.render('Dashboard/referral-list', { users });
			}
		});

	},

	//GET /profile
	getProfile(req, res, next) {
		res.render('Dashboard/profile', { title: 'User Profile' });
	},

	//PUT /profile
	async updateProfile(req, res, next) {
		const {
			username,
			email
		} = req.body;
		const { user } = res.locals;
		if (user) user.username = username;
		if (email) user.email = email;
		await user.save();
		const login = util.promisify(req.login.bind(req));
		await login(user);
		req.session.success = "Profile successfully updated!";
		console.log('Profile successfully updated');
		res.redirect('/profile');
	},

	// GET /forgot-password
	getForgotPw(req, res, next) {
		res.render('forgot');
	},

	//PUT /forgot-password
	async putForgotPw(req, res, next) {
		const token = await crypto.randomBytes(20).toString('hex');

		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			req.session.error = 'No account with that email address exists.';
			return res.redirect('/forgot-password');
		}

		user.resetPasswordToken = token;
		user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

		await user.save();


		const msg = {
			to: user.email,
			from: 'Clevebet ICO <besthands7777@gmail.com>',
			subject: 'Clevebet ICO - Forgot Password / Reset',
			text: `You are receiving this because you (or someone else) have requested the reset of the password for your account with Username: ${user.username}.
				Please click on the following link, or copy and paste it into your browser to complete the process:
				http://${req.headers.host}/reset/${token}
				If you did not request this, please ignore this email and your password will remain unchanged.`.replace(/				/g, ''),
		};

		await sgMail.send(msg);

		req.session.success = `An e-mail has been sent to ${user.email} with further instructions. Check in your spam folder also`;
		res.redirect('/forgot-password');
	},

	//GET /reset
	async getReset(req, res, next) {
		const { token } = req.params;
		const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } })
		if (!user) {
			req.session.error = 'Password reset token is invalid or has expired.';
			return res.redirect('/forgot-password');
		}
		res.render('reset', { token });
	},

	// PUT /reset
	async putReset(req, res, next) {
		const { token } = req.params;
		const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpires: { $gt: Date.now() } });

		if (!user) {
			req.session.error = 'Password reset token is invalid or has expired.';
			return res.redirect(`/reset/${token}`);
		}

		if (req.body.password === req.body.confirm) {
			await user.setPassword(req.body.password);
			user.resetPasswordToken = null;
			user.resetPasswordExpires = null;
			await user.save();
			const login = util.promisify(req.login.bind(req));
			await login(user);
		} else {
			req.session.error = 'Passwords do not match.';
			return res.redirect(`/reset/${token}`);
		}

		const msg = {
			to: user.email,
			from: 'Clevebet ICO <besthands7777@gmail.com>',
			subject: 'Clevebet ICO - Password Changed',
			text: `Hello,
			  This email is to confirm that the password for your account has just been changed.
			  If you did not make this change, please hit reply and notify us at once.`.replace(/		  	/g, '')
		};

		await sgMail.send(msg);

		req.session.success = 'Password successfully updated!';
		res.redirect('/dashboard');
	},

	//POST /purchaseLtc
	postPurchaseLtc(req, res, next) {
		let price = parseFloat(req.body.price);
		// console.log("Price is " + typeof (price));
		const amount = price / 1;
		// console.log(typeof (amount));
		// console.log(amount);
		const user = req.user;
		// Create transaction
		client.createTransaction({
			currency1: "USD",
			currency2: "LTC",
			amount: price,
			buyer_email: user.email
		},
			function (err, result) {
				if (price < 10) {
					res.redirect("/buy")
				} else {
					if (err) {
						console.log(err);
					} else {
						let ltcAddress = result.address;
						let ltcPrice = result.amount;
						let code = result.qrcode_url;
						let txnId = result.txn_id;

						const txInfo = //get transaction ID
							function () {
								client.getTx({ txid: txnId }, function (err, result) {
									if (err) {
										console.log(err);
									} else {
										if (result.status === 0) {
											req.session.error = "Awaiting payment";
											// console.log("Awaiting payment!!");
										} else if (result.status === 1) {
											user.tokensOwned += parseFloat(amount);
											user.save();
											req.session.success = result.status_text;
											// console.log(user.tokensOwned);
											// console.log("Paid!!!");
											User.findById(user.referrer, function (err, user) {
												if (err) {
													console.log(err)
												} else {
													user.referralTokens += amount / 0.1;
													user.save();
												}
											});
										}
										// console.log(result);
									}
								});
							}
						setTimeout(function () { txInfo() }, 600000);
						res.render('Dashboard/purchaseLtc', { title: 'Buy CVB Tokens', ltcAddress, price, code, ltcPrice });
					}
				}
			});
	},

	//POST /purchaseBtc
	postPurchaseBtc(req, res, next) {
		let price = parseFloat(req.body.price);
		const amount = price / 1;
		const user = req.user;
		// Create transaction
		client.createTransaction({
			currency1: "USD",
			currency2: "BTC",
			amount: price,
			buyer_email: user.email
		},
			function (err, result) {
				if (price < 10) {
					res.redirect("/buy")
				} else {
					if (err) {
						console.log(err);
					} else {
						let btcAddress = result.address;
						let btcPrice = result.amount;
						let code = result.qrcode_url;
						let txnId = result.txn_id;
						console.log(txnId);
						console.log(btcAddress);
						console.log(code);
						console.log(result);

						const txInfo = //get transaction ID
							function () {
								client.getTx({ txid: txnId }, function (err, result) {
									if (err) {
										console.log(err);
									} else {
										if (result.status === 0) {
											req.session.error = "Awaiting payment";
											// console.log("Awaiting payment!!");
										} else if (result.status === 1) {
											user.tokensOwned += parseFloat(amount);
											user.save();
											req.session.success = result.status_text;
											// console.log(user.tokensOwned);
											// console.log("Paid!!!");
											User.findById(user.referrer, function (err, user) {
												if (err) {
													console.log(err)
												} else {
													user.referralTokens += amount / 0.1;
													user.save();
												}
											});
										}
										// console.log(result);
									}
								});
							}
						setTimeout(function () { txInfo() }, 600000);
						res.render('Dashboard/purchaseBtc', { title: 'Buy CVB Tokens', btcAddress, price, code, btcPrice });
					}
				}
			});
	},

	//POST /purchaseEth
	postPurchaseEth(req, res, next) {
		let price = parseFloat(req.body.price);
		const amount = price / 1;
		const user = req.user;
		// Create transaction
		client.createTransaction({
			currency1: "USD",
			currency2: "ETH",
			amount: price,
			buyer_email: user.email
		},
			function (err, result) {
				if (price < 10) {
					res.redirect("/buy")
				} else {
					if (err) {
						console.log(err);
					} else {
						let ethAddress = result.address;
						let ethPrice = result.amount;
						let code = result.qrcode_url;
						let txnId = result.txn_id;
						console.log(txnId);
						console.log(ethAddress);
						console.log(code);
						console.log(result);

						const txInfo = //get transaction ID
							function () {
								client.getTx({ txid: txnId }, function (err, result) {
									if (err) {
										console.log(err);
									} else {
										if (result.status === 0) {
											req.session.error = "Awaiting payment";
											// console.log("Awaiting payment!!");
										} else if (result.status === 1) {
											user.tokensOwned += parseFloat(amount);
											user.save();
											req.session.success = result.status_text;
											// console.log(user.tokensOwned);
											// console.log("Paid!!!");
											User.findById(user.referrer, function (err, user) {
												if (err) {
													console.log(err)
												} else {
													user.referralTokens += amount / 0.1;
													user.save();
												}
											});
										}
										// console.log(result);
									}
								});
							}
						setTimeout(function () { txInfo() }, 600000);
						res.render('Dashboard/purchaseEth', { title: 'Buy CVB Tokens', ethAddress, price, code, ethPrice });
					}
				}
			});
	},

	//GET /transfer
	getTransfer(req, res, next) {
		res.render('Dashboard/transfer');
	},

	//POST /transfer
	async postTransfer(req, res, next) {
		let currentUser = req.user;
		const amount = req.body.amount;
		const otherEmail = req.body.otherEmail;
		User.findOne({ email: otherEmail }, function (err, user) {
			if (err) {
				console.log(err);
			} else {
				if (currentUser.tokensOwned < amount) {
					req.session.error = "Your current token balance is less than the number of tokens you are attempting to transfer";
				} else {
					currentUser.tokensOwned -= parseFloat(amount);
					currentUser.save();
					user.tokensOwned += amount;
					user.save();
					req.session.success = "Tokens successfully transferred";
					const msg = {
						to: currentUser.email,
						from: 'Clevebet ICO <ico@clevebet.com>',
						subject: 'Clevebet ICO - Token Transfer',
						text: `You have successfully transfered ${amount} CVB Tokens from your account with Username: ${currentUser.username} to another CLEVEBET user with email ${user.email}.`.replace(/				/g, ''),
					};

					sgMail.send(msg);
					// req.session.success = `An e-mail has been sent to ${user.email} with further instructions. Check in your spam folder also`;
					res.redirect("/dashboard");
				}
			}
		});
	},

	//GET /buy
	getBuy(req, res, next) {
		res.render('Dashboard/buy');
	},

	//GET /admin
	getAdmin(req, res, next) {
		User.find({}, function (err, users) {
			if (err) {
				console.log(err);
			} else {
				res.render('Dashboard/admin', { title: 'Buy CVB Tokens', users });
			}
		});
	},

	//delete /admin
	deleteAdmin(req, res, next) {
		// console.log(req.params);
		User.findById({ _id: req.params.id }, function (err, user) {
			if (err) {
				console.log(err)
			} else {
				user.remove();
				req.session.success = "User Deleted!";
				console.log("User removed!");
				res.redirect("/admin");
			}
		});
	},

	//GET /logout
	getLogout(req, res, next) {
		req.logout();
		req.session.success = "Logged out Successfully";
		res.redirect('/');
	}
};
