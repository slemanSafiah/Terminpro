const { Exception, httpStatus } = require('../../../utils');

const Service = require('./Services');

class ServicesService {
	constructor(data) {
		this.name = data.name;
		this.age = data.age;
		this.public = 10;
		this.private = 10;
		this.optional = data.optional;
		this.type = data.type;
		this.width = data.width;
		this.hight = data.hight;
		this.lang = data.lang;
		this.long = data.long;
	}

	async save() {
		const result = await new Service(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	async update(id) {
		const result = await Service.findByIdAndUpdate(id, this);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Item not found');
		return;
	}

	static async delete(id) {
		const result = await Service.findByIdAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Item not found');
		return;
	}

	static async getById(id) {
		const result = await Service.findById(id);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Item not found');
		return { data: result };
	}

	static async getByCriteria(criteria = {}, { limit = 100, skip = 50, total = false }) {
		const result = { data: await Service.find(criteria, {}, { limit, skip }) };
		if (total) result.total = Service.countDocuments(criteria);
		return result;
	}
}

module.exports = ServicesService;
