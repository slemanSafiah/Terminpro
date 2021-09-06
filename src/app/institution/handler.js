const _ = require('lodash');
const Institution = require('./service');
const { httpStatus } = require('../../../utils');

module.exports = {
	/** Add a new Institution */
	save: async (req, res) => {
		const data = req.body;
		const result = await new Institution(data).save();
		res.status(httpStatus.CREATED).json(result);
	},

	/** Rating an Institution */
	rate: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await Institution.rate(id, data);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Update a Institution */
	update: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await new Institution(data).update(id);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Add image to a slider */
	addToSlider: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await Institution.addToSlider(id, data);
		res.status(httpStatus.UPDATED);
	},

	/** Delete image from slider */
	deleteFromSlider: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await Institution.deleteFromSlider(id, data);
		res.status(httpStatus.UPDATED);
	},

	/** Get Institution by id */
	getById: async (req, res) => {
		const { id } = req.params;
		const result = await Institution.getById(id);
		res.status(httpStatus.OK).json(result);
	},

	// /** Get Institutions by criteria */
	getByCriteria: async (req, res) => {
		const criteria = _.pick(req.query, ['name', 'cat', 'subCat', 'sort']);
		const pagination = _.pick(req.query, ['limit', 'skip', 'total']);
		const result = await Institution.getByCriteria(criteria, pagination);
		res.status(httpStatus.OK).json(result);
	},
};
