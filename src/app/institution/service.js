const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Category = require('../admin/category/Category');
const Institution = require('./Institution');
const User = require('../user/User');
const Plan = require('../plan/Plan');

class InstitutionService {
	constructor(data) {
		this.owner = data.owner;
		this.email = data.email;
		this.name = data.name;
		this.subtitle = data.subtitle;
		this.description = data.description;
		this.category = data.category;
		this.subCategory = data.subCategory;
		this.address = data.address;
		this.photo = data.photo;
		this.paypalEmail = data.paypalEmail;
		this.openingDays = data.openingDays;
		this.openAt = data.openAt;
		this.closeAt = data.closeAt;
		this.slider = data.slider;
		this.subscription = data.subscription;
	}

	async save() {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const institution = await Institution.findOne({ email: this.email }).session(session);
			if (institution) throw new Exception(httpStatus.CONFLICT, 'Institution Already exists');

			let categories = await Category.find({});
			categories = categories.map((ele) => {
				return ele.name;
			});

			if (
				categories.findIndex((ele) => {
					return ele === this.category;
				}) === -1
			) {
				throw new Exception(httpStatus.CONFLICT, 'Category not found');
			}

			if (this.photo) this.photo = Buffer.from(this.photo, 'base64');
			if (this.slider)
				this.slider = this.slider.map((ele) => {
					return Buffer.from(ele, 'base64');
				});

			result = await new Institution(this).save({ session });
			if (!result) throw new Exception();
		});
		return { data: { id: result._id } };
	}

	static async rate(id, data) {
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const user = await User.findOne({ _id: mongoose.Types.ObjectId(data.id) });
			if (!user) throw new Exception(httpStatus.NOT_FOUND, 'User Not Found');
			const inst = await Institution.findOne({ _id: id });
			if (!inst) throw new Exception(httpStatus.NOT_FOUND, 'Institution Not Found');

			await Institution.updateOne(
				{ _id: id },
				{
					$pull: {
						rating: {
							user: data.id,
						},
					},
				},
				{ session }
			);
			const result = await Institution.updateOne(
				{ _id: id },
				{
					$push: {
						rating: {
							user: mongoose.Types.ObjectId(data.id),
							rate: data.rate,
							ratedAt: Date.now(),
						},
					},
				},
				{ session }
			);
			if (!result.nModified) throw new Exception();
		});
		return;
	}

	async update(id) {
		if (this.photo) this.photo = Buffer.from(this.photo, 'base64');
		if (this.slider)
			this.slider = this.slider.map((ele) => {
				return Buffer.from(ele, 'base64');
			});
		const result = await Institution.findOneAndUpdate({ _id: id }, this, {
			omitUndefined: true,
			useFindAndModify: false,
		});
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async subscribe(id, data) {
		const institution = await Institution.findOne({ _id: id });
		if (!institution) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');

		const plan = await Plan.findOne({ _id: mongoose.Types.ObjectId(data.id) });
		if (!plan) throw new Exception(httpStatus.NOT_FOUND, 'plan not found');
		if (plan.available === false) throw new Exception(httpStatus.CONFLICT, 'Plan are not available');

		const result = await Institution.updateOne(
			{ _id: id },
			{
				$set: {
					subscription: {
						plan: data.id,
						start: Date.now(),
					},
					notified: false,
					blocked: false,
					freezed: false,
				},
			}
		);
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'Error in modification');

		return;
	}

	static async unsubscribe(id) {
		const institution = await Institution.findOne({ _id: id });
		if (!institution) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');

		const result = await Institution.updateOne({ _id: id }, { $set: { subscription: null } });
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'Error in modification');

		return;
	}

	static async addToSlider(data) {
		if (data.image) data.image = Buffer.from(data.image, 'base64');
		const result = await Institution.findOneAndUpdate(
			{ _id: id },
			{ $push: { slider: data.image } },
			{ useFindAndModify: false }
		);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async deleteFromSlider(id, data) {
		const result = await Institution.findOneAndUpdate(
			{ _id: id },
			{ $pull: { slider: { _id: data.id } } },
			{ useFindAndModify: false }
		);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async delete(id) {
		const result = await Institution.findOneAndDelete({ _id: id }, { useFindAndModify: false });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async getById(id) {
		const result = await Institution.findById(id).populate('subscription');
		const data = result.toObject({ virtuals: true });
		delete data.rating;
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'institution not found');
		return { data: data };
	}

	static async getByPlan(id) {
		const result = await Institution.find({ 'subscription.plan': id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'institutions not found');
		return { data: result };
	}

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.name) result['name'] = { $regex: criteria.name, $options: 'i' };
			if (criteria.cat) result['category'] = { $regex: criteria.cat, $options: 'i' };
			if (criteria.subCat) result['subCategory'] = { $regex: criteria.subCat, $options: 'i' };
			return result;
		})();

		const result = await Institution.find(condition, '-rating -slider', { limit, skip })
			.sort({ name: criteria.sort })
			.lean();
		let data = { data: result };
		if (total) {
			data.total = await Institution.countDocuments({});
		}
		return data;
	}
}

module.exports = InstitutionService;
