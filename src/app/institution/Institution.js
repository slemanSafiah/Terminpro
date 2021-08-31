const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const categories = ['hairCut', 'bodyHelth'];
const Address = require('../../../utils/schemaHelper/Address');
const Rating = require('../../../utils/schemaHelper/Rate');

function arrayLimit(val) {
	return val.length < 8;
}

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
		openAt: { type: Number, required: true },
		closeAt: { type: Number, required: true },
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Institution = mongoose.model('Institution', InstitutionSchema, 'Institutions');

module.exports = Institution;
