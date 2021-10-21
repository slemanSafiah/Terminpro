const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Appointment = require('./Appointment');
const User = require('../user/User');
const Service = require('../service/Services');
const Employee = require('../employee/Employee');

class AppointmentService {
	constructor(data) {
		this.date = data.date;
		this.history = data.history;
		this.service = data.service;
		this.institution = data.institution;
		this.user = data.user;
		this.employee = data.employee;
		this.end = data.end;
	}

	async save() {
		const user = await User.findOne({ _id: this.user });
		if (!user) throw new Exception(httpStatus.CONFLICT, 'User not found');

		const service = await Service.findOne({ _id: this.service });
		if (!service) throw new Exception(httpStatus.CONFLICT, 'Service not found');

		const employee = await Employee.findOne({ _id: this.employee });
		if (!employee) throw new Exception(httpStatus.CONFLICT, 'Employee not found');
		let appointment = await Appointment.findOne({
			employee: this.employee,
			history: this.history,
		});
		if (appointment) throw new Exception(httpStatus.CONFLICT, "Appointment can't be reserved");

		const result = await new Appointment(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	static async delete(id) {
		const result = await Appointment.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Appointment not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		const result = await Appointment.findById(id)
			.populate('institution', 'openingDays name description address rating')
			.populate('employee', 'firstName lastName rating specialty')
			.populate('service', 'name description length price');
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Appointment not found');
		return { data: result };
	}

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.service) result['service'] = criteria.service;
			if (criteria.institution) result['institution'] = criteria.institution;
			if (criteria.user) result['user'] = criteria.user;
			if (criteria.employee) result['employee'] = criteria.employee;
			if (criteria.history) result['history'] = criteria.history;
			return result;
		})();
		const result = await Appointment.find(condition, '', { limit, skip })
			.populate('institution', 'openingDays name description address')
			.populate('employee', 'firstName lastName specialty')
			.populate('service', 'name description length price')
			.sort({ history: criteria.sort })
			.sort({ date: criteria.sort })
			.lean();
		let data = { data: result };
		if (total) {
			data.total = await Appointment.countDocuments({});
		}
		return data;
	}
}

module.exports = AppointmentService;
