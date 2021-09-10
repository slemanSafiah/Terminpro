const { Exception, httpStatus } = require('../../../utils');
const { generateToken, resetToken, verifyResetToken } = require('../../../utils/token/token');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const sendEmail = require('../../../utils/helper/email');

class UserService {
	constructor(data) {
		this.type = data.type;
		this.email = data.email;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.password = data.password;
		this.phone_1 = data.phone_1;
		this.phone_2 = data.phone_2;
		this.photo = data.photo;
		this.address = data.address;
		this.urls = data.urls;
	}

	async save() {
		const user = await User.findOne({ email: this.email });
		if (user) throw new Exception(httpStatus.CONFLICT, 'User Already exists');
		if (this.photo) this.photo = Buffer.from(this.photo, 'base64');
		const result = await new User(this).save();

		if (!result) throw new Exception();
		return { data: { id: result.id } };
	}

	static async updatePhoto(id, data) {
		if (data.photo) data.photo = Buffer.from(data.photo, 'base64');

		const result = await User.updateOne({ _id: id }, data);

		return;
	}

	async update(id) {
		if (this.photo) this.photo = Buffer.from(this.photo, 'base64');
		const result = await User.findOneAndUpdate({ _id: id }, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async verify(id) {
		//TODO check the sms code sent to the user in sign up
		const user = await User.findOne({ _id: id });
		if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		const result = await User.updateOne({ _id: id }, { verified: true });
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'error');
		return;
	}

	static async changePassword(id, data) {
		const user = await User.findOne({ _id: id });
		if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		const result = await User.updateOne({ _id: id }, { password: data.password });
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'error');
		return;
	}

	static async forgetPasswordEmail(email) {
		// add random number to the db
		const user = await User.findOne({ email: email });
		if (!user) return { msg: 'an email sent' };
		const token = await resetToken({ _id: user._id });
		console.log(token);
		await User.updateOne({ resetToken: token });

		//TODO ADD SESSION
		const res = await sendEmail(token, email);
		return;
	}

	static async resetPassword(token, password) {
		const user = await User.findOne({ resetToken: token });
		if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User not found');

		let decode = await verifyResetToken(token);
		if (!decode) throw new Exception(httpStatus.CONFLICT, 'token is not valid');

		const result = await User.updateOne({ _id: decode._id }, { $set: { password: password, resetToken: '' } });
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'error in update password');

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

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.fn) result['firstName'] = { $regex: criteria.fn, $options: 'i' };
			if (criteria.ln) result['lastName'] = { $regex: criteria.ln, $options: 'i' };
			return result;
		})();

		let projection = ['_id', 'firstName', 'lastName', 'phone1', 'phone2', 'address', 'photo'];

		const result = await User.find(condition, projection, { limit, skip })
			.sort({ firstName: criteria.sort })
			.sort({ lastName: criteria.sort })
			.lean();
		let data = { data: result };
		if (total) {
			data.total = await User.countDocuments({});
		}
		return data;
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
				phone1: result.phone1,
				phone2: result.phone2,
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
		//TODO send sms with verify code
		return result;
	}
}

module.exports = UserService;
