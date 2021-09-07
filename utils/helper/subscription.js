const Institution = require('../../src/app/institution/Institution');
const Plan = require('../../src/app/plan/Plan');

module.exports = async () => {
	const today = new Date();
	const todayPlusTen = new Date();
	todayPlusTen.setDate(todayPlusTen.getDate() + 10);
	const inst = await Institution.find({ 'subscription.plan': { $ne: null } });
	await Promise.all(
		inst.map((ele) => {
			return new Promise(async (resolve, reject) => {
				const plan = await Plan.findOne({ _id: ele.subscription.plan });
				const length = plan.length;
				const endSubscription = new Date(ele.subscription.start);
				endSubscription.setMonth(endSubscription.getMonth() + length);
				if (endSubscription <= today) {
					//end subscription
					await Institution.updateOne({ _id: ele._id }, { $set: { subscription: null } });
					//send sms and update notify
				} else if (endSubscription <= todayPlusTen && !ele.notified) {
					//subscription gonna end in  ten days
					await Institution.updateOne({ _id: ele._id }, { $set: { notified: true } });
					//send sms and update notify
				}
			});
		})
	);
};
