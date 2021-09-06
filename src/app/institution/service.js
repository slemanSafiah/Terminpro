const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Institution = require('./Institution');
const User = require('../user/User');

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
		this.creditCard = data.creditCard;
		this.openingDays = data.openingDays;
		this.openAt = data.openAt;
		this.closeAt = data.closeAt;
		this.slider = data.slider;
	}

	async save() {
		let result;
		const session = await mongoose.startSession();
		await session.withTransaction(async (session) => {
			const institution = await Institution.findOne({ email: this.email }).session(session);

			if (institution) if (user) throw new Exception(httpStatus.CONFLICT, 'user Already exists');

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
		const result = await Institution.findOneAndUpdate({ _id: id }, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async addToSlider(data) {
		const result = await Institution.findOneAndUpdate({ _id: id }, { $push: { slider: data.image } });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async deleteFromSlider(id, data) {
		const result = await Institution.findOneAndUpdate({ _id: id }, { $pull: { slider: { _id: data.id } } });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async delete(id) {
		const result = await Institution.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Item not found');
		return;
	}

	static async getById(id) {
		const result = await Institution.findById(id);
		const data = result.toObject({ virtuals: true });
		delete data.rating;
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Item not found');
		return { data: data };
	}

	static async getByCriteria(criteria, { limit, skip, total }) {
		let condition = (() => {
			let result = {};
			if (criteria.name) result['name'] = { $regex: criteria.name, $options: 'i' };
			if (criteria.cat) result['category'] = { $regex: criteria.cat, $options: 'i' };
			if (criteria.subCat) result['subCategory'] = { $regex: criteria.subCat, $options: 'i' };
			return result;
		})();

		const result = await Institution.find(condition, '-rating', { limit, skip })
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
