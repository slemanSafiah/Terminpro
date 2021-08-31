const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Appointment = require('./Appointment');
const User = require('../user/User');
const Service = require('../service/Services');
const Employee = require('../employee/Employee');

class AppointmentService {
	constructor(data) {
		this.date = data.date;
		this.service = data.service;
		this.institution = data.institution;
		this.user = data.user;
		this.employee = data.employee;
	}

	async save() {
		const user = await User.findOne({ _id: this.user });
		if (!user) throw new Exception(httpStatus.CONFLICT, 'User not found');

		const service = await Service.findOne({ _id: this.service });
		if (!service) throw new Exception(httpStatus.CONFLICT, 'Service not found');

		const employee = await Employee.findOne({ _id: this.employee });
		if (!employee) throw new Exception(httpStatus.CONFLICT, 'Employee not found');

		const result = await new Appointment(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	async update(id) {}

	static async delete(id) {}

	static async getById(id) {}
}

module.exports = AppointmentService;
