const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const categories = ['hairCut', 'bodyHelth'];
const Address = require('../../../utils/schemaHelper/Address');

const Rating = new Schema(
	{
		user: Schema.Types.ObjectId,
		rate: Number,
		ratedAt: { type: Date, default: Date.now() },
	},
	{ _id: false }
);

const InstitutionSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
		owner: { type: Schema.ObjectId, required: true },
		email: { type: String, required: true },
		name: { type: String, required: true },
		description: { type: String, required: true },
		category: { type: String, enum: categories, required: true },
		subCategory: [String],
		address: [Address],
		rating: [Rating],
		photo: { type: Schema.Types.Buffer },
		creditCard: { type: String },
		openingDays: [String],
		openingTimes: [String], //start with monday
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Institution = mongoose.model('Institution', InstitutionSchema, 'Institutions');

module.exports = Institution;
