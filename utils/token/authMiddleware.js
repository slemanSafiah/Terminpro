const { verify } = require('./token');
const User = require('../../src/app/user/User');
const { Exception, httpStatus } = require('../index');
const mongoose = require('mongoose');

exports.auth = async (req, res, next) => {
	const excluded = ['/login', '/signup'];
	if (excluded.indexOf(req.url) > -1) {
		return next();
	}
	let token = null;
	if (req.headers.authorization) {
		token = req.headers.authorization.split(' ')[1];
	}
	if (!token) return res.status(httpStatus.UNAUTHORIZED).json({ msg: 'invalid token' });

	try {
		if (!(await verify(token))) return res.status(httpStatus.UNAUTHORIZED).json({ msg: 'invalid token' });
		else {
			req.body.user = await verify(token);
			const user = await User.findOne({ _id: mongoose.Types.ObjectId(req.body.user.id) });
			req.body.user.ability = user.abilities;

			next();
		}
	} catch (error) {
		return res.status(httpStatus.UNAUTHORIZED).json({ msg: 'invalid token' });
	}
};
