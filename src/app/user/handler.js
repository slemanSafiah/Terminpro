const _ = require('lodash');
const User = require('./service');
const { httpStatus } = require('../../../utils');

module.exports = {
	/** Add a new User */
	save: async (req, res) => {
		const data = req.body;
		const result = await new User(data).save();
		res.status(httpStatus.CREATED).json(result);
	},

	/** Update a User */
	update: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await new User(data).update(id);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Verify User */
	verify: async (req, res) => {
		const { id } = req.params;
		await User.verify(id);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Update a photo */
	updatePhoto: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await User.updatePhoto(id, data);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** delete a photo */
	deletePhoto: async (req, res) => {
		const { id } = req.params;
		await User.deletePhoto(id);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Delete a User */
	delete: async (req, res) => {
		const { id } = req.params;
		const result = await User.delete(id);
		res.status(httpStatus.OK).json(result);
	},

	/** Get User by id */
	getById: async (req, res) => {
		const { id } = req.params;
		const result = await User.getById(id);
		res.status(httpStatus.OK).json(result);
	},

	/** Get Users by criteria */
	getByCriteria: async (req, res) => {
		const criteria = _.pick(req.query, ['age']);
		const pagination = _.pick(req.query, ['limit', 'offset', 'total']);
		const result = await User.getByCriteria(criteria, pagination);
		res.status(httpStatus.OK).json(result);
	},

	/** Sign up for user */
	signup: async (req, res) => {
		const data = req.body;
		console.log(data);
		const result = await new User(data).signup();
		res.status(httpStatus.CREATED).json(result);
	},

	/** Login in for user */
	login: async (req, res) => {
		const data = req.body;
		const result = await User.login(data);
		res.status(httpStatus.OK).json(result);
	},
};
