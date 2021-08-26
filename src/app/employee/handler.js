const _ = require('lodash');
const Employee = require('./service');
const { httpStatus } = require('../../../utils');

module.exports = {
	/** Add a new Employee */
	save: async (req, res) => {
		const data = req.body;
		const result = await new Employee(data).save();
		res.status(httpStatus.CREATED).json(result);
	},

	/** Rating an Employee */
	rate: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await Employee.rate(id, data);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Update a Employee */
	update: async (req, res) => {
		const { id } = req.params;
		const data = req.body;
		await new Employee(data).update(id);
		res.sendStatus(httpStatus.UPDATED);
	},

	/** Delete a Employee */
	delete: async (req, res) => {
		const { id } = req.params;
		const result = await Employee.delete(id);
		res.status(httpStatus.OK).json(result);
	},

	/** Get Employee by id */
	getById: async (req, res) => {
		const { id } = req.params;
		const result = await Employee.getById(id);
		res.status(httpStatus.OK).json(result);
	},

	// /** Get Employees by criteria */
	// getByCriteria: async (req, res) => {
	// 	const criteria = _.pick(req.query, ['age']);
	// 	const pagination = _.pick(req.query, ['limit', 'offset', 'total']);
	// 	const result = await Employee.getByCriteria(criteria, pagination);
	// 	res.status(httpStatus.OK).json(result);
	// },
};
