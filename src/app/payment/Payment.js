const { string } = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PaymentStatus = ['Pending', 'Done'];

const Item = new Schema(
	{
		name: String,
		sku: String,
		price: String,
		currency: String,
		quantity: Number,
	},
	{ _id: false }
);

const Transaction = new Schema(
	{
		item_list: {
			items: [Item],
		},
		amount: {
			currency: String,
			total: String,
		},
		description: String,
	},
	{ _id: false }
);

const PaymentSchema = new Schema(
	{
		_id: { type: Schema.Types.ObjectId, auto: true },
		paymentId: { type: String, required: true },
		user: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
		institution: { type: Schema.Types.ObjectId, required: true, ref: 'Institution' },

		status: { type: String, enum: PaymentStatus, default: 'Pending' },
		paymentDate: { type: Date, default: Date.now() },

		data: Transaction,
	},
	{
		timestamps: true,
		useNestedStrict: true,
		optimisticConcurrency: true,
	}
);

PaymentSchema.methods.nextStatus = function (status = undefined) {
	const statuses = ['Pending', 'Done'];
	const currentStatus = status || this.status;
	const currentIndex = statuses.findIndex((val) => val === currentStatus);

	if (!currentIndex) throw new Error('Status Not Found');
	if (currentIndex === statuses.length - 1) throw new Error('No More Status Left');

	return statuses[currentIndex + 1];
};

const Payment = mongoose.model('Payment', PaymentSchema, 'Payments');

module.exports = Payment;
