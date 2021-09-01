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
		owner: Joi.objectId().required(),
		email: Joi.string().email().required(),
		name: Joi.string().min(3).max(20).trim().required(),
		description: Joi.string().required(),
		category: Joi.string()
			.valid(...categories)
			.required(),
		subCategory: Joi.array().items(Joi.string()).unique(),
		phone: Joi.string().required(),
		photo: Joi.string().base64(),
		address: {
			country: Joi.string(),
			city: Joi.string(),
			location: Joi.string(),
			longitude: Joi.number(),
			latitude: Joi.number(),
		},
		creditCard: Joi.string(),
		openingDays: Joi.array()
			.items(Joi.string().valid(...days))
			.required(),
		openAt: Joi.number().max(24).min(0).required(),
		closeAt: Joi.number().max(24).min(0).required(),
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

const rate = Joi.object({
	body: {
		rate: Joi.number().max(5).min(1).required(),
		id: Joi.objectId().required(),
	},
	params: {
		id: Joi.objectId().required(),
	},
});

module.exports = {
	paramId: validate(paramId),
	save: validate(save),
	update: validate(update),
	rate: validate(rate),
};
