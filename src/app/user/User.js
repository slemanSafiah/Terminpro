const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;
const Address = require('../../../utils/schemaHelper/Address');
const userType = ['owner', 'user'];

const UserSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
		type: { type: String, enum: userType, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true },
		password: {
			type: String,
			required: true,
			trim: true,
			set: (val) => (val ? bcrypt.hashSync(val, 10) : undefined),
		},
		phone_1: { type: String, required: true, unique: true },
		phone_2: { type: String, unique: true },
		address: {
			type: Address,
		},
		photo: {
			type: Schema.Types.Buffer,
		},
		urls: {
			facebook: String,
			instagram: String,
			tiktok: String,
			website: String,
		},
		verified: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const User = mongoose.model('User', UserSchema, 'Users');

module.exports = User;
