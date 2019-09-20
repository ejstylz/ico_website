const express = require('express');
const router = express.Router();

const {
	postRegister,
	postLogin,
	getLogout,
	getSignup,
	getLogin,
	getDashboard,
	getProfile,
	updateProfile,
	postPurchaseLtc,
	postPurchaseBtc,
	postPurchaseEth,
	getBuy,
	getTransfer,
	postTransfer,
	getAdmin,
	deleteAdmin,
	getForgotPw,
	putForgotPw,
	getReset,
	putReset,
	getReferralList
} = require('../controllers');
const {
	asyncErrorHandler,
	isLoggedIn,
	isValidPassword,
	changePassword,
	checkAuthorization,
	purchaseMiddleware
} = require('../middleware');

/* GET home page. */
router.get('/', (req, res, next) => {
	res.render('index', { title: 'Clevebet ICO - Home' });
});

/* GET sign-up */
router.get('/sign-up', getSignup);

/* POST sign-up */
router.post('/sign-up', asyncErrorHandler(postRegister));

/* GET login */
router.get('/login', getLogin);

/* POST login */
router.post('/login', asyncErrorHandler(postLogin));

/* GET logout */
router.get('/logout', isLoggedIn, getLogout);

/* GET profile */
router.get('/profile', isLoggedIn, asyncErrorHandler(getProfile));

/* PUT profile */
router.put('/profile',
	isLoggedIn,
	asyncErrorHandler(isValidPassword),
	asyncErrorHandler(changePassword),
	asyncErrorHandler(updateProfile)
);

/* GET Dashboard */
router.get('/dashboard', isLoggedIn, asyncErrorHandler(getDashboard));

/* GET referral-list */
router.get('/referral', isLoggedIn, asyncErrorHandler(getReferralList));

/* POST PurchaseLtc */
router.post('/purchaseLtc', isLoggedIn, asyncErrorHandler(postPurchaseLtc));

/* POST PurchaseBtc */
router.post('/purchaseBtc', isLoggedIn, asyncErrorHandler(postPurchaseBtc));

/* POST PurchaseEth */
router.post('/purchaseEth', isLoggedIn, asyncErrorHandler(postPurchaseEth));

/* GET Buy */
router.get('/buy', isLoggedIn, asyncErrorHandler(getBuy));

/* GET Transfer */
router.get('/transfer', isLoggedIn, asyncErrorHandler(getTransfer));

/* POST Transfer */
router.post('/transfer', isLoggedIn, asyncErrorHandler(postTransfer));

/* GET admin */
router.get('/admin', checkAuthorization, asyncErrorHandler(getAdmin));

// DELETE admin
router.delete('/admin/:id', isLoggedIn, asyncErrorHandler(deleteAdmin));

/* GET forgot */
router.get('/forgot-password', getForgotPw);

/* PUT forgot */
router.put('/forgot-password', asyncErrorHandler(putForgotPw));

/* GET /reset/:token */
router.get('/reset/:token', asyncErrorHandler(getReset));

/* PUT /reset/:token */
router.put('/reset/:token', asyncErrorHandler(putReset));


module.exports = router;
