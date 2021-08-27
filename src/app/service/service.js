const { Exception, httpStatus } = require('../../../utils');

const Service = require('./Services');

class ServicesService {
	constructor(data) {
		this.name = data.name;
		this.institution = data.institution;
		this.category = data.category;
		this.description = data.description;
		this.length = data.length;
		this.price = data.price;
		this.atLeast = data.atLeast;
		this.retainer = data.retainer;
		this.hasRetainer = data.hasRetainer;
	}

	async save() {
		const result = await new Service(this).save();

		if (!result) throw new Exception();

		return { data: { id: result.id } };
	}

	async update(id) {
		const result = await Service.findByIdAndUpdate(id, this, { omitUndefined: true });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return;
	}

	static async delete(id) {
		const result = await Service.findByIdAndDelete({ _id: id });
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return;
	}

	static async getById(id) {
		const result = await Service.findById(id);
		if (!result) throw new Exception(httpStatus.NOT_FOUND, 'Service not found');
		return { data: result };
	}
}

module.exports = ServicesService;
