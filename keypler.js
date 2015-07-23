
if(Meteor.isServer){

	Keypler = function(configObj){
		/*configObj's defaults

		{
			publish: true,
			makeLicense: function(userId){
				//returns a license based off of a userId, default returns a SHA of the id plus the timestamp multiplied by math.random
			},
			licenseType: "sha" | "guid"//only to be set if makeLicense is not defined - as a note, the guid makeLicense function does not actually use the userId
		}


		*/

		for(key in configObj)
			this[key] = configObj[key]


		if(!this.makeLicense){

			if(!this.licenseType)
				this.licenseType = "sha"

			if(this.licenseType.toLowerCase() == "guid")
				this.makeLicense = function(userId){
					return uuid.v4();
				}				
			else
				this.makeLicense = function(userId){
					return CryptoJS.SHA1(userId + Date.now() * Math.random()).toString();
				}

		}

		var keyplerThis = this;

		Meteor.methods({
			generateLicense: function(userId){//todo, add some verification so people can't run `Meteor.call('generateLicense')` from client side
				//idea: give users a separate, hidden ID, and update based on that id, so only the server can know which user is being updated
				//alternately, check for permission with this.userId

				var user = Meteor.users.findOne({_id: userId})

				if(user && user.services && user.services.keypler && user.services.keypler.license)
					return false;

				Meteor.users.update({_id: userId}, {$set:{'services.keypler.license': keyplerThis.makeLicense(userId)}})


				return Meteor.users.findOne({_id: userId}, {
					fields: {
						_id: 1,
						'services.keypler.license': 1
					}
				})
			}
		})

		if(this.publish === undefined || this.publish)
			Meteor.publish('_keypler_userKey', function(){

				return Meteor.users.find({_id: this.userId}, {fields: 
					{
						'services.keypler.license': 1
					}
				})
			})

		Accounts.onCreateUser(function(options, user){

			if(!user.services)
				user.services = {};

			user.services.keypler = {};
			user.services.keypler.license = "";

			if(options.profile)
				user.profile = options.profile;

			return user;
		})


		Router.route('/keypler_verify', function(){
			/*
				POST request with JSON body
				key `email` has user's email
				key `license` has license
				response: 
					202 if the key is verified
					400 if it's not a POST request
					401 if the key doesn't match

			*/

			var req = this.request;
			var res = this.response;
			

			if(req.method !== "POST"){
				res.writeHead(400, {'Content-Type': 'text/plain'});
				res.write("Bad request");
				return res.end();
			}

				
			// res.status(200).send('A+').end();
			var userQuery = Meteor.users.findOne({'emails.0.address': req.body.email, 'services.keypler.license': req.body.license});
			if(userQuery && userQuery.services && userQuery.services.keypler && userQuery.services.keypler.license){//they have a license
				res.writeHead(202, {'Content-Type': 'text/plain'});
				res.write("Everything checks out, boss");
				
				return res.end();
			}
			

			res.writeHead(401, {'Content-Type': 'text/plain'});
			res.write("This user's key is invalid!");
			res.end();

		},
		{where: 'server'})	

	};



	// Keypler.HMACKey = "RazzleFrazzle";

	// Keypler.setHMACKey = function(key){
	// 	Keypler.HMACKey = key;
	// }

	/*
	_Keypler_KeyCollection = new Meteor.Collection('_keypler_keyCollection');

	Router.route('/keypler_webhook', function () {
		var req = this.request;
		var res = this.response;

		console.log(req)
		console.log(req.method)//GET OR POST
		console.log(req.body)


		//Psuedocode to be implemented when more details are figured out

		// ALLOWED_ADDRESSES = ["allowedEmail@sendgrid.com", "test@test.test"]

		// if(ALLOWED_ADDRESSES.indexOf(req.body.from) == -1)//so people can't spoof emails
		// 	return;

		// var userEmail = ....//some field

		// if(_Keypler_KeyCollection.findOne({userEmail: userEmail}))//user already has an auth key
		// 	return;

		// _Keypler_KeyCollection.insert({userEmail: userEmail})


		//get user's name
		//update collection
		//https://sendgrid.com/docs/API_Reference/Webhooks/parse.html

		

		



		res.end('hello from the server\n');
	}, {
		where: 'server'
	});
	*/





}

if(Meteor.isClient){
	Meteor.subscribe('_keypler_userKey')
}