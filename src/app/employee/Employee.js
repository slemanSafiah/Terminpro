const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
	{
		_id: { type: Schema.ObjectId, auto: true },
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

const Employee = mongoose.model('Employee', EmployeeSchema, 'Employees');

module.exports = Employee;
