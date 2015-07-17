if(Meteor.isServer){

	_Keypler_KeyCollection = new Meteor.Collection('_keypler_keyCollection');

	Router.route('/keypler_webhook', function () {
		var req = this.request;
		var res = this.response;
		
		console.log(req)
		console.log(req.method)//GET OR POST
		console.log(req.body)

		//update collection
		//https://sendgrid.com/docs/API_Reference/Webhooks/parse.html

		res.end('hello from the server\n');
	}, {
		where: 'server'
	});	
}