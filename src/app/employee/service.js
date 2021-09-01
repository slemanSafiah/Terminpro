const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Employee = require('./Employee');
const User = require('../user/User');
const bcrypt = require('bcryptjs');
const { generateToken } = require('../../../utils/token/token');
const Institution = require('../institution/Institution');
const Service = require('../service/Services');
const Appointment = require('../appointment/Appointment');
const _ = require('lodash');

class EmployeeService {
	constructor(data) {
		this.institution = data.institution;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.email = data.email;
		this.specialty = data.specialty;
		this.password = data.password;
		this.photo = data.photo;
	}

	async save() {
		const emp = await Employee.findOne({ email: this.email });

		if (emp) throw new Exception(httpStatus.CONFLICT, 'Employee already exists');

		const inst = await Institution.findOne({ _id: this.institution });

		if (!inst) throw new Exception(httpStatus.CONFLICT, 'Institution not found');

		const result = await new Employee(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	async update(id) {
		const result = await Employee.updateOne({ _id: id }, this, { omitUndefined: true });
		return;
	}

	static async updatePhoto(id, data) {
		const result = await Employee.updateOne({ _id: id }, data);

		return;
	}

	static async rate(id, data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const user = await User.findOne({ _id: mongoose.Types.ObjectId(data.id) });
			if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User Not Found');
			const inst = await Employee.findOne({ _id: id });
			if (!inst) throw new Exception(httpStatus.NOT_FOUND, 'Employee Not Found');

			await Employee.updateOne(
				{ _id: id },
				{
					$pull: {
						rating: {
							user: data.id,
						},
					},
				},
				{ session }
			);
			const result = await Employee.updateOne(
				{ _id: id },
				{
					$push: {
						rating: {
							user: mongoose.Types.ObjectId(data.id),
							rate: data.rate,
							ratedAt: Date.now(),
						},
					},
				},
				{ session }
			);
			if (!result.nModified) throw new Exception();
		});
		return;
	}

	static async delete(id) {
		const result = await Employee.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Employee not found');
		return { msg: 'done' };
	}

	static async deletePhoto(id) {
		const result = await Employee.findOneAndUpdate({ _id: id }, { photo: null });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Employee not found');
		return;
	}

	static async getById(id) {
		const result = await Employee.findById(id).lean();
		const sum = result.rating.reduce((acc, cur) => {
			return acc + cur.rate;
		}, 0);
		const data = { ...result };
		data.rate = result.rating.length > 0 ? sum / result.rating.length : 0;
		delete data.rating;
		delete data.password;
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Employee not found');
		return { data: data };
	}

	static async getAvailableTimes(id) {
		const emp = await Employee.findOne({ _id: id });
		const inst = await Institution.findOne({ _id: emp.institution });
		const start = inst.openAt;
		const end = inst.closeAt;

		let times = this.initialTimes(start, end);

		let appointments = await Appointment.find({ employee: id }, 'date service -_id');

		let busyTimes = await Promise.all(
			appointments.map((app) => {
				return new Promise(async (resolve, reject) => {
					let servicePromise = await Promise.all(
						app.service.map((serv) => {
							return new Promise(async (resolve, reject) => {
								let service = await Service.findOne({ _id: serv }, 'length'); //1.5

								resolve({ startTime: app.date, length: service.length });
							});
						})
					);
					let time = servicePromise.reduce((acc, curr) => {
						return (acc += curr.length);
					}, 0);
					resolve({ start: servicePromise[0].startTime, total: time });
				});
			})
		);
		busyTimes = busyTimes.map((ele) => {
			let addMin = (ele.total - Math.floor(ele.total)) * 60; //30
			if (addMin > 0 && addMin <= 15) addMin = 15;
			else if (addMin <= 30) addMin = 30;
			else if (addMin <= 45) addMin = 45;
			else addMin = 60;
			let addHour = Math.floor(ele.total); //1
			let time = ele.start.split(':'); //['12 ' , ' 30']

			let startHour = parseInt(time[0]) + addHour; //12+1 = 13
			let startMin = parseInt(time[1]) + addMin; //30+30 = 60

			if (startMin >= 60) {
				startHour += Math.floor(startMin / 60);
				startMin -= 60 * Math.floor(startMin / 60);
			}

			return this.initialTimes(parseInt(time[0]) + parseInt(time[1]) / 60, startHour + startMin / 60);
		});
		busyTimes = _.flatten(busyTimes);
		let newTimes = _.pullAll(times, busyTimes);
		times = this.normalizeTimes(newTimes);

		return times;
	}

	static async login(data) {
		const result = await Employee.findOne({ email: data.email });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Employee not found');
		let validPassword = await bcrypt.compare(data.password, result.password);
		if (validPassword) {
			const token = await generateToken({ id: result._id });
			const data = {
				_id: result._id,
				email: result.email,
				firstName: result.firstName,
				lastName: result.lastName,
				photo: result.photo,
				specialty: result.specialty,
			};
			return { data, token };
		}
		throw new Exception(httpStatus.NOT_FOUND, 'wrong password');
	}

	static initialTimes(start, end) {
		let times = [];
		for (let i = start; i < end; i += 0.25) {
			times.push(i);
		}

		return times;
	}

	static normalizeTimes(times) {
		const normalizedTimes = times.map((ele) => {
			let minute = (ele - Math.floor(ele)) * 60;
			let hour = Math.floor(ele);
			let time = hour.toString() + ' : ' + (minute == 0 ? '00' : minute.toString());
			return time;
		});
		return normalizedTimes;
	}
}

module.exports = EmployeeService;
