const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Appointment = require('./ِAppointment');
const User = require('../user/User');

class AppointmentService {
	constructor(data) {}

	async save() {}

	async update(id) {}

	static async delete(id) {}

	static async getById(id) {}
}

module.exports = AppointmentService;
