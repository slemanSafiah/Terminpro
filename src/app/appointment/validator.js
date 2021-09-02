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
		date: Joi.string().required(),
		service: Joi.objectId().required(),
		institution: Joi.objectId().required(),
		user: Joi.objectId().required(),
		employee: Joi.objectId().required(),
	},
});

module.exports = {
	paramId: validate(paramId),
	save: validate(save),
};
