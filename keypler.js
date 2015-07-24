
if(Meteor.isServer){

	Keypler = function(configObj){
		/*configObj's defaults

		{
			publish: true,
			makeLicense: function(userId){
				//returns a license based off of a userId, default returns a SHA of the id plus the timestamp multiplied by math.random
			},
			licenseType: "sha" | "guid"//only to be set if makeLicense is not defined - as a note, the guid makeLicense function does not actually use the userId,
			makeVerificationRoute: true//whether or not a route is created
		}

		*/

		var self = this;

		for(key in configObj)
			this[key] = configObj[key]


		if(!this.makeLicense){//configure the makeLicense function, if it hasn't been defined yet

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


		this.generateLicense = function(userId){//Keypler function to generate a license - only available serverside, like the rest of Keypler

			var user = Meteor.users.findOne({_id: userId})

			if(user && user.services && user.services.keypler && user.services.keypler.license)
				return false;//returns false if the user has a license

			return Meteor.users.update({_id: userId}, {$set:{'services.keypler.license': this.makeLicense(userId)}})
			//returns the id of the user who received a license
		}

		if(this.publish === undefined || this.publish)
			Meteor.publish('_keypler_userKey', function(){

				return Meteor.users.find({_id: this.userId}, {fields: 
					{
						'services.keypler.license': 1
					}
				})
			})

		Accounts.onCreateUser(function(options, user){//give all new users an empty license

			if(!user.services)
				user.services = {};

			user.services.keypler = {};
			user.services.keypler.license = null;

			if(options.profile)
				user.profile = options.profile;

			return user;
		})

		if(this.makeVerificationRoute === undefined || this.makeVerificationRoute)
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


				var query = {};

				if(req.body.email)
					query['emails.0.address'] = req.body.email
				
				if(req.body.id)
					query['_id'] = req.body.id


				if(Object.keys(query).length == 0 || req.method !== "POST"){
					res.writeHead(400, {'Content-Type': 'text/plain'});
					res.write("Bad request");
					return res.end();
				}

				query['services.keypler.license'] = req.body.license

				// res.status(200).send('A+').end();
				var userQuery = Meteor.users.findOne(query);

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

		if(this.makeGumroadRoute)
			Router.route('/' + (configObj.gumroadRouteName || "keypler_gumroad"), function(){
				/*
					POST request with JSON body
					https://gumroad.com/webhooks

					User matching the user in the `email` field of the post body will get a license
				*/

				var req = this.request;
				var res = this.response;

				var userEmail = req.body.email;

				var query = {};

				query['emails.address'] = userEmail;

				var user = Meteor.users.findOne(query);

				if(!user){
					res.writeHead(400, {'Content-Type': 'text/plain'});
					res.write("User with email '" + userEmail + "' not found!");
					return res.end();
				}

				self.generateLicense(user._id)

				res.writeHead(200, {'Content-Type': 'text/plain'});

				res.write(Meteor.absoluteUrl());

				return res.end();

			},
			{where: 'server'})

		};


}

if(Meteor.isClient){
	Meteor.subscribe('_keypler_userKey')//automatically subscribe to this - only publish the actual data if configured
}