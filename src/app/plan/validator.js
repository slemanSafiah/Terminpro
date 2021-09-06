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
		sku: Joi.string().required(),
		price: Joi.string().required(),
		employeeLimit: Joi.number().min(1).required(),
		serviceLimit: Joi.number().min(1).required(),
		length: Joi.number().min(1).required(),
		available: Joi.boolean(),
	},
});

const update = Joi.object({
	body: {
		sku: Joi.string(),
		price: Joi.string(),
		employeeLimit: Joi.number().min(1),
		serviceLimit: Joi.number().min(1),
		length: Joi.number().min(1),
		available: Joi.boolean(),
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
