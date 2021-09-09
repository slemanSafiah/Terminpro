const { Exception, httpStatus } = require('../../../../utils');
const Category = require('./Category');

class CategoryService {
	constructor(data) {
		this.name = data.name;
		this.image = data.image;
	}

	async save() {
		const result = await new Category(this).save();
		if (!result) throw new Exception();

		return { data: { id: result._id } };
	}

	async update(id) {
		const category = await Category.findOne({ _id: id });
		if (!category) throw new Exception(httpStatus.CONFLICT, 'Category not found');

		const result = await Category.updateOne({ _id: id }, this, {
			omitUndefined: true,
			useFindAndModify: false,
			new: true,
		});
		if (!result.nModified) throw new Exception(httpStatus.INTERNAL_SERVER_ERROR, 'Error in update Category data');

		return { data: result };
	}

	static async delete(id) {
		const result = await Category.findOneAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Category not found');
		return { msg: 'done' };
	}

	static async getById(id) {
		const result = await Category.findById(id);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Category not found');
		return { data: result };
	}

	static async getAllCategories() {
		const result = await Category.find({});
		if (result.length === 0) throw new Exception(httpStatus.NOT_FOUND, 'no categories found');
		return { data: result };
	}
}

module.exports = CategoryService;
