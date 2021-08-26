const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Employee = require('./Employee');
const User = require('../user/User');

class EmployeeService {
	constructor(data) {}

	async save() {}

	async update(id) {}

	static async delete(id) {}

	static async getById(id) {}
}

module.exports = EmployeeService;
