const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const { validate } = require('../../../utils/validator');

const paramId = Joi.object({
	params: {
		id: Joi.objectId().required(),
	},
});

const save = Joi.object({
	body: {
		type: Joi.string().valid('user', 'owner').required(),
		email: Joi.string().email().required(),
		firstName: Joi.string().min(3).max(20).trim().required(),
		lastName: Joi.string().min(3).max(20).trim().required(),
		password: Joi.string().required(),
		phone: Joi.string().required(),
		photo: Joi.string().base64(),
		address: {
			country: Joi.string(),
			city: Joi.string(),
			location: Joi.string(),
			longitude: Joi.number(),
			latitude: Joi.number(),
		},
	},
});

const update = Joi.object({
	body: {
		firstName: Joi.string(),
		lastName: Joi.string(),
		password: Joi.string(),
		phone: Joi.string(),
		photo: Joi.string().base64(),
		address: {
			country: Joi.string(),
			city: Joi.string(),
			location: Joi.string(),
			longitude: Joi.number(),
			latitude: Joi.number(),
		},
	},
	params: {
		id: Joi.objectId().required(),
	},
});

const login = Joi.object({
	body: {
		email: Joi.string().email().required(),
		password: Joi.string().required(),
	},
});

module.exports = {
	paramId: validate(paramId),
	save: validate(save),
	update: validate(update),
	login: validate(login),
};
