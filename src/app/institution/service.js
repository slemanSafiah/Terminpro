const { Exception, httpStatus } = require('../../../utils');
const mongoose = require('mongoose');
const Category = require('../admin/category/Category');
const Institution = require('./Institution');
const User = require('../user/User');
const Plan = require('../plan/Plan');
const paths = require('../../../paths');
const fs = require('fs').promises;

async function uploadImage(photo) {
	let image = Buffer.from(photo, 'base64');
	let fileName = Date.now().toString() + '.jpg';
	await fs.writeFile(`./uploads/institution/${fileName}`, image);
	return `/uploads/institution/${fileName}`;
}

class InstitutionService {
	constructor(data) {
		this.owner = data.owner;
		this.email = data.email;
		this.name = data.name;
		this.subtitle = data.subtitle;
		this.description = data.description;
		this.phone = data.phone;
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

			if (this.photo) {
				this.photo = await uploadImage(this.photo);
			}
			if (this.slider)
				this.slider = await Promise.all(
					this.slider.map((ele) => {
						return new Promise(async (resolve, reject) => {
							let image = await uploadImage(ele);
							resolve(image);
						});
					})
				);

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
		const result = await Institution.findOneAndUpdate({ _id: id }, this, {
			omitUndefined: true,
			useFindAndModify: false,
		});
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async updatePhoto(id, data) {
		if (data.photo) {
			const photo = await uploadImage(data.photo);
			const result = await Institution.findOneAndUpdate(
				{ _id: id },
				{ photo: photo },
				{
					omitUndefined: true,
					new: false,
					useFindAndModify: false,
				}
			);
			if (result.photo) await fs.unlink(`${paths.app}/${result.photo}`);
		}
		return;
	}

	static async subscribe(id, data) {
		try {
			const institution = await Institution.findOne({ _id: id });
			console.log(institution);
			if (!institution) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');

			const plan = await Plan.findOne({ _id: mongoose.Types.ObjectId(data.id) });
			console.log(plan);
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
		} catch (err) {
			console.log(err);
		}
		return;
	}

	static async unsubscribe(id) {
		const institution = await Institution.findOne({ _id: id });
		if (!institution) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');

		const result = await Institution.updateOne({ _id: id }, { $set: { subscription: null } });
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'Error in modification');

		return;
	}

	static async addToSlider(id, data) {
		if (data.image) data.image = await uploadImage(data.image);
		const result = await Institution.findOneAndUpdate(
			{ _id: id },
			{ $push: { slider: data.image } },
			{ useFindAndModify: false }
		);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async deletePhoto(id) {
		const result = await Institution.findOneAndUpdate({ _id: id }, { photo: null });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		await fs.unlink(`${paths.app}/${result.photo}`);
		return;
	}

	static async deleteFromSlider(id, data) {
		const result = await Institution.findOneAndUpdate(
			{ _id: id },
			{ $pull: { slider: `/uploads/institution/${data.fileName}` } },
			{ useFindAndModify: false }
		);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		await fs.unlink(`${paths.app}/uploads/institution/${data.fileName}`);
		return;
	}

	static async delete(id) {
		const result = await Institution.findOneAndDelete({ _id: id }, { useFindAndModify: false });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Institution not found');
		return;
	}

	static async getById(id) {
		const result = await Institution.findById(id).populate('subscription');
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'institution not found');
		const data = result.toObject({ virtuals: true });
		delete data.rating;
		if (isNaN(data.rating)) data.rate = 0;
		if (data.photo) data.photo = process.env.IMAGE//await fs.readFile(`${paths.app}/${data.photo}`, 'base64');
		data.slider = await Promise.all(
			data.slider.map((img) => {
				return new Promise(async (resolve, reject) => {
					const fileName = img.split('/');
					if (img) img = process.env.IMAGE//await fs.readFile(`${paths.app}/${img}`, 'base64');
					resolve({ image: img, fileName: fileName[fileName.length - 1] });
				});
			})
		);
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

		let resultWithImage = await Promise.all(
			result.map((inst) => {
				return new Promise(async (resolve, reject) => {
					if (inst.photo) inst.photo = process.env.IMAGE//await fs.readFile(`${paths.app}/${inst.photo}`, 'base64');
					resolve(inst);
				});
			})
		);

		let data = { data: resultWithImage };
		if (total) {
			data.total = await Institution.countDocuments({});
		}
		return data;
	}
}

module.exports = InstitutionService;
