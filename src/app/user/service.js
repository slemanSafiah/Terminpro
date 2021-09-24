const { Exception, httpStatus } = require('../../../utils');
const { generateToken, resetToken, verifyResetToken } = require('../../../utils/token/token');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./User');
const path = require('path');
const fs = require('fs').promises;
const sendEmail = require('../../../utils/helper/email');
const generateCode = require('../../../utils/helper/generateCode');
const paths = require('../../../paths');

class UserService {
	constructor(data) {
		this.type = data.type;
		this.email = data.email;
		this.firstName = data.firstName;
		this.lastName = data.lastName;
		this.password = data.password;
		this.address = data.address;
		this.phone_1 = data.phone_1;
		this.phone_2 = data.phone_2;
		this.photo = data.photo;
		this.urls = data.urls;
	}

	async save() {
		const user = await User.findOne({ email: this.email });
		if (user) throw new Exception(httpStatus.CONFLICT, 'User Already exists');
		if (this.photo) {
			let image = Buffer.from(this.photo, 'base64');
			let fileName = Date.now().toString() + '.jpg';
			this.photo = `/uploads/user/${fileName}`;
			await fs.writeFile(`./uploads/user/${fileName}`, image);
		}
		const result = await new User(this).save();

		if (!result) throw new Exception();
		return { data: { id: result._id } };
	}

	static async updatePhoto(id, data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			if (data.photo) {
				let image = Buffer.from(data.photo, 'base64');
				let fileName = Date.now().toString() + '.jpg';
				let photo = `/uploads/user/${fileName}`;
				await fs.writeFile(`./uploads/user/${fileName}`, image);
				const result = await User.findOneAndUpdate(
					{ _id: id },
					{ photo: photo },
					{
						omitUndefined: true,
						new: false,
						session: session,
					}
				);
				if (result.photo) await fs.unlink(`${paths.app}/${result.photo}`);
			}
		});
		return;
	}

	async update(id) {
		if (this.photo) this.photo = Buffer.from(this.photo, 'base64');
		const result = await User.findOneAndUpdate({ _id: id }, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async verify(id, code) {
		const user = await User.findOne({ _id: id });
		if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		if (user.verifyCode !== code) throw new Exception(httpStatus.CONFLICT, 'wrong verification code');
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
		await User.updateOne({ resetToken: token });
		await sendEmail(token, email);
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
		await fs.unlink(`${paths.app}/${result.photo}`);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return;
	}

	static async delete(id) {
		const result = await User.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		try {
			const result = await User.findById(id, '-password');
			if (result.photo) result.photo = await fs.readFile(`${paths.app}/${result.photo}`, 'base64');
			if (!result) throw new Exception(httpStatus.NOT_FOUND, 'User not found');
			return { data: result };
		} catch (err) {
			console.log(err);
		}
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

		let resultWithImage = await Promise.all(
			result.map((user) => {
				return new Promise(async (resolve, reject) => {
					if (user.photo) user.photo = await fs.readFile(`${paths.app}/${user.photo}`, 'base64');
					resolve(user);
				});
			})
		);

		let data = { data: resultWithImage };
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

			if (data.photo) data.photo = await fs.readFile(`${paths.app}/${data.photo}`, 'base64');

			return { data, token };
		}
		throw new Exception(httpStatus.NOT_FOUND, 'wrong password');
	}

	async signup() {
		const result = await this.save();
		const token = await generateToken({ id: result.data.id, type: result.data.type });
		result.token = token;
		if (!result) throw new Exception(httpStatus.CONFLICT, 'User already exist');

		const code = generateCode();
		await User.updateOne({ _id: result.data.id }, { $set: { verifyCode: code } });
		//TODO send sms with verify code
		const message = `your verification code is ${code}, verify your account to get the best with us`;

		return result;
	}
}

module.exports = UserService;
