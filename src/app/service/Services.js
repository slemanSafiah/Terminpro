const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ServiceSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
		name: { type: String, required: true },
		category: { type: String, required: true },
		description: { type: String, required: true },
		length: { type: Number, required: true },
		price: { type: Number, required: true },
		atLeast: { type: Boolean },
		retainer: { type: Number },
		hasRetainer: { type: Boolean },
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Service = mongoose.model('Service', ServiceSchema, 'Services');

module.exports = Service;
