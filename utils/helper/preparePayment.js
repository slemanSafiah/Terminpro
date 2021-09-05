exports.prepareSubscription = async (data) => {
	//TODO use axios to get subscription information
	const subscription = {
		price: '25.00',
		description: 'you are use the first version',
	};
	const paymentObject = {
		pay: {
			intent: 'sale',
			payer: {
				payment_method: 'paypal',
			},
			redirect_urls: {
				return_url: 'http://localhost:5000/api/payment/success',
				cancel_url: 'http://localhost:5000/api/payment/failed',
			},
			transactions: [
				{
					item_list: {
						items: [
							{
								name: 'subscription',
								sku: data.sku,
								price: subscription.price,
								currency: 'USD',
								quantity: 1,
							},
						],
					},
					amount: {
						currency: 'USD',
						total: subscription.price,
					},
					description: subscription.description,
				},
			],
		},
	};
	return paymentObject;
};

exports.preparePayment = async (data) => {
	//TODO get the email of the owner of institution
	const email = 'sb-emkjy7504394@personal.example.com';
	//TODO calculate the total amount
	const amount = '100.00';

	const res = {
		actionType: 'PAY',
		currencyCode: 'USD',
		receiverList: {
			receiver: [
				{
					amount: amount,
					email: email,
				},
			],
		},
		returnUrl: 'https://example.com/success.html',
		cancelUrl: 'https://example.com/failure.html',
		requestEnvelope: {
			errorLanguage: 'en_US',
			detailLevel: 'ReturnAll',
		},
	};

	return res;
};
