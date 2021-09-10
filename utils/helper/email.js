const nodemailer = require('nodemailer');
const template = require('./template');

module.exports = async (token, email) => {
	const link = `http://lcoalhost:8080/resetpass?token=${token}`;
	const html = template(link);

	const transporter = nodemailer.createTransport({
		host: 'smtp.gmail.com',
		port: 465, //465
		secure: true,
		auth: {
			user: 'slemansafiah45@gmail.com',
			pass: '5771125sss',
		},
	});

	const info = await transporter.sendMail({
		from: 'test@test.com', // sender address
		to: email, // list of receivers
		subject: 'Reset Password', // Subject line
		html: html, // html body
	});
	return 'done';
};
