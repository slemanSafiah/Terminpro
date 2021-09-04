const handler = require('./handler');
const router = require('express').Router();
const { Exception, httpStatus } = require('../../../utils');
const validator = require('./validator');
const { auth } = require('../../../utils/token/authMiddleware');
const paypal = require('paypal-rest-sdk');
const mongoose = require('mongoose');

paypal.configure({
	mode: process.env.MODE,
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
});

/*********************************
 * @Router /api/private/template *
 *********************************/
router.get('/success', (req, res) => {
	const payerId = req.query.PayerID;
	const paymentId = req.query.paymentId;
	const data = {
		payer_id: payerId,
		transactions: [
			{
				amount: {
					currency: 'USD',
					total: '125.00',
				},
			},
		],
	};

	paypal.payment.execute(paymentId, data, function (err, payment) {
		if (err) {
			throw err;
		}
		console.log(JSON.stringify(payment));
		res.send('success');
	});
});

router.post('/', auth, validator.save, Exception.generalErrorHandler(handler.save));

router.put('/:id', auth, validator.update, Exception.generalErrorHandler(handler.update));

router.put('/:id/photo', auth, validator.paramId, Exception.generalErrorHandler(handler.updatePhoto));

router.put('/:id/verify', auth, validator.paramId, Exception.generalErrorHandler(handler.verify));

router.delete('/:id/photo', auth, validator.paramId, Exception.generalErrorHandler(handler.deletePhoto));

router.delete('/:id', auth, validator.paramId, Exception.generalErrorHandler(handler.delete));

router.get('/:id', validator.paramId, Exception.generalErrorHandler(handler.getById));

router.get('/', validator.getByCriteria, Exception.generalErrorHandler(handler.getByCriteria));

router.post('/signup', validator.save, Exception.generalErrorHandler(handler.signup));

router.post('/login', validator.login, Exception.generalErrorHandler(handler.login));

router.post('/pay', (req, res) => {
	const data = req.body.pay;
	paypal.payment.create(data, function (err, payment) {
		if (err) throw err;
		for (let i = 0; i < payment.links.length; i++) {
			if (payment.links[i].rel === 'approval_url') {
				console.log(payment.links[i].href);
				res.status(httpStatus.OK).json({ redirect_url: payment.links[i].href });
			}
		}
	});
});

module.exports = router;
