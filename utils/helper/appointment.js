const Institution = require('../../src/app/institution/Institution');
const Appointment = require('../../src/app/appointment/Appointment');
const User = require('../../src/app/user/User');
const fs = require('fs');

module.exports = async () => {
	const today = new Date();
	const todayMinusYear = new Date();
	todayMinusYear.setFullYear(todayMinusYear.getFullYear() - 1);
	const appointments = await Appointment.find(
		{ createdAt: { $lte: todayMinusYear } },
		'date history user institution'
	)
		.populate('user', 'firstName lastName -_id')
		.populate('institution', 'name -_id')
		.lean();

	let appoints = appointments.map((ele) => {
		let hist = ele.history.toString();
		let history = {};
		history.day = hist.substr(6, 2);
		history.month = hist.substr(4, 2);
		history.year = hist.substr(0, 4);
		let appointment = { ...ele };
		appointment.history = history;
		return appointment;
	});

	//TODO SAVE TO EXTERNAL FILE IN SPECIFIC STYLE

	console.log(appoints);
	const result = await Appointment.bulkWrite([
		{
			deleteMany: {
				filter: { createdAt: { $lte: todayMinusYear } },
			},
		},
	]);
};
