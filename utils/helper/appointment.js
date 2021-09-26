const Institution = require('../../src/app/institution/Institution');
const Appointment = require('../../src/app/appointment/Appointment');
const User = require('../../src/app/user/User');
const pdf = require('pdf-creator-node');
const paths = require('../../paths');
const fs = require('fs').promises;
const months = ['Jan' , 'Feb' , 'Mar' , 'Apr' , 'May' , 'Jun' , 'Jul' , 'Aug' , 'Sep' , 'Oct', 'Nov', 'Dec'];
const {checkDir} = require('./checkdir');

module.exports = async () => {
	try{
	const today = new Date();
	const todayDate = `${today.getFullYear()}-${today.getMonth()+1}-${today.getDate()}`;
	const todayMinusYear = new Date();
		//TODO test again with right data
	todayMinusYear.setFullYear(todayMinusYear.getFullYear() - 1);
	const appointments = await Appointment.find(
		{ createdAt: { $lte: todayMinusYear } },
		'date history user institution'
	)
		// .populate('user', 'firstName lastName -_id')
		// .populate('institution', 'name -_id')
		 .lean();

	let appoints = appointments.map((ele) => {
		let hist = ele.history.toString();
		let appointment = { ...ele };
		appointment.day = hist.substr(6, 2);
		appointment.month = hist.substr(4, 2);
		appointment.year = hist.substr(0, 4);
		return appointment;
	});

	
	//TODO SAVE TO EXTERNAL FILE IN SPECIFIC STYLE
	const path = `${paths.app}/uploads/appointment/${today.getFullYear()-1}/${months[((today.getMonth()-1)+12)%12]}/backup.pdf`;
	await checkDir(`${paths.app}/uploads/appointment/${today.getFullYear()-1}/${((today.getMonth()-1)+12)%12}`);
	await checkDir(path);
	
	if(appoints.length > 0){
		//await fs.appendFile(path , JSON.stringify(appoints));
		let html = await fs.readFile(`${paths.app}/utils/helper/appointment.html`,'utf-8');
		const options = {
			format : 'A4',
			orientation : 'portrait',
			border: "10mm"
		}

		const doc = {
			html : html,
			data : {
				appointments:[...appoints, ...appoints],
				today : todayDate
			},
			path : path
		};

		await pdf.create(doc , options);

	}

	console.log(appoints);

	// const result = await Appointment.bulkWrite([
	// 	{
	// 		deleteMany: {
	// 			filter: { createdAt: { $lte: todayMinusYear } },
	// 		},
	// 	},
	// ]);
}catch(err){
	console.log(err)
}
};
