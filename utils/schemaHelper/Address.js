const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const Address = new Schema(
	{
		country: { type: String },
		city: { type: String },
		location: { type: String },
		longitude: { type: Number },
		latitude: { type: Number },
	},
	{ _id: false }
);

module.exports = Address;
