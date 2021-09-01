const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { validate } = require('../../../utils/validator');
const categories = ['category1', 'category2'];
const days = ['saturday , sunday , monday ,tuesday', 'wednesday', 'thursday', 'friday'];

const paramId = Joi.object({
	params: {
		id: Joi.objectId().required(),
	},
});

const save = Joi.object({
	body: {
		institution: Joi.objectId().required(),
		name: Joi.string().min(3).trim().required(),
		description: Joi.string().required(),
		category: Joi.string().required(),
		length: Joi.number().required(),
		price: Joi.number().required(),
		atLeast: Joi.bool(),
		retainer: Joi.number(),
		hasRetainer: Joi.bool(),
	},
});

const update = Joi.object({
	body: {
		name: Joi.string().min(3).max(20).trim(),
		description: Joi.string(),
		category: Joi.string().valid(...categories),
		subCategory: Joi.array().items(Joi.string()).unique(),
		phone: Joi.string(),
		photo: Joi.string().base64(),
		address: {
			country: Joi.string(),
			city: Joi.string(),
			location: Joi.string(),
			longitude: Joi.number(),
			latitude: Joi.number(),
		},
		creditCard: Joi.string(),
		openingDays: Joi.array().items(Joi.string().valid(...days)),
		openAt: Joi.number().max(24).min(0),
		closeAt: Joi.number().max(24).min(0),
	},
	params: {
		id: Joi.objectId(),
	},
});

module.exports = {
	paramId: validate(paramId),
	save: validate(save),
	update: validate(update),
};
