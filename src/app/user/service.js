const { Exception, httpStatus } = require('../../../utils');
const { generateToken } = require('../../../utils/token/token');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');

class UserService {
	constructor(data) {
		this.type = data.type;
		this.email = data.email;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.password = data.password;
		this.phone = data.phone;
		this.photo = data.photo;
		this.address = data.address;
	}

	async save() {
		const user = await User.findOne({ email: this.email });
		if (user) throw new Exception(httpStatus.CONFLICT, 'User Already exists');

		const result = await new User(this).save();

		if (!result) throw new Exception();
		return { data: { id: result.id } };
	}

	static async updatePhoto(id, data) {
		const result = await User.updateOne({ _id: id }, data);

		return;
	}

	async update(id) {
		const result = await User.findOneAndUpdate({ _id: id }, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async verify(id) {
		const result = await User.updateOne({ _id: id }, { verified: true });
		if (!result.nModified) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async deletePhoto(id) {
		const result = await User.findOneAndUpdate({ _id: id }, { photo: null });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async delete(id) {
		const result = await User.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		const result = await User.findById(id, '-password');
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return { data: result };
	}

	static async login(data) {
		const result = await User.findOne({ email: data.email });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		let validPassword = await bcrypt.compare(data.password, result.password);
		if (validPassword) {
			const token = await generateToken({ id: result._id, type: result.type });
			const data = {
				_id: result._id,
				type: result.type,
				email: result.email,
				firstName: result.firstName,
				lastName: result.lastName,
				phone: result.phone,
				photo: result.photo,
				address: result.address,
			};
			return { data, token };
		}
		throw new Exception(httpStatus.NOT_FOUND, 'wrong password');
	}

	async signup() {
		const result = await this.save();
		console.log(result);
		const token = await generateToken({ id: result.data.id, type: result.data.type });
		result.token = token;
		if (!result) throw new Exception(httpStatus.CONFLICT, 'User already exist');
		return result;
	}
}

module.exports = UserService;
