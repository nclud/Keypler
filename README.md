# Keypler

Automated API & License key generation, for Meteor!

**Warning** Keypler is still in development and not completely finished. When it is, this message will be gone and Keypler will be available on Atmosphere.

## Usage

In the server's code, simply add `var yourKeypler = new Keypler(options)` to instantiate Keypler. See the **Configuration** section for details on how to use `options`.

To generate a new license, call `yourKeypler.generateLicense(userId)`. For security purposes, this method, along with the `Keypler` object, is only available on the server side.

## Configuration

The following table explains the fields, their defaults, and what they do.

| Field                   | Type       | Default                                          | Description
| ----------------------- | ---------- | ------------------------------------------------ | ----------------------
| `publish`               | `boolean`  | `true`                                           | Defines whether or not Keypler will publish a user's license to the client side. This means users can see their license by looking at `Meteor.user().services.keypler.license`
| `makeLicense`           | `function` | SHA or GUID function, depending on `licenseType` | A function which takes an argument of `userId` and returns a license key.
| `licenseType`           | `String`   | `"sha"`                                          | The type of license to return. **Only to be defined if you do *not* define your own `makeLicense` function.** Options are `sha` and `guid`. Note: The `guid` function generated a random GUID. The `sha` function generates a SHA-1 hash based off of the userId salted with `Math.random() * Date.now()`
| `makeVerificationRoute` | `boolean`  | `true`                                           | If `makeVerificationRoute` is set to true, Keypler will create a serverside route called `/keypler_verify` which can verify licenses
| `makeGumroadRoute`      | `boolean`  | `false`                                          | Will define a route which handles a Gumroad webhook, available at `/keypler_gumroad`. The user account with an email matching the buyer's email will receive a license key.
| `gumroadRouteName`      | `String`   | `keypler_gumroad`                                | If you set `makeGumroadRoute` to `true`, you will have an API endpoint which Gumroad will send POST requests to. The endpoint's url will be `http://your.meteor.app/{gumroadRouteName}`. By default, it is `http://your.meteor.app/keypler_gumroad`. In order to keep this secure, and prevent a user from spoofing a Gumroad webhook, please give your endpoint a unique name.

Keypler will automatically give each new user a `services.keypler.license` field, which has `license` set to `null` by default.

## Authentication

Keypler uses Iron Router to create a server route called `/keypler_verify` where external applications can authenticate. This route is created by default, but you can disable it by setting `makeVerificationRoute` to false in the configuration object.

To authenticate a user, send a `POST` request to `http://your.meteor.app/keypler_verify`. The `POST` body should contain the following JSON

```JSON
{
	"email": "userEmail",
	"id": "userId",
	"license": "userLicense"
}
```

The `license` value is mandatory, and you can submit *either* the user's email in the `email` field, or the user's `_id` in the `id` field (No underscore in the `id` field in the `POST` body). 

The route will return a status code of `202` if the user has the license specified in the body of the request. Otherwise, a `401` is returned.

## Gumroad Webhook

If you set the `makeGumroadRoute` value to `true` in the config file, you will create an API endpoint at `http://your.meteor.app/keypler_gumroad`. You will need to configure webhooks for your Gumroad product and point them here. Then, whenever someone purchases your product on Gumroad, a POST notification will be sent to your endpoint.

Please make it known to your buyers that they *must* have an account on your Meteor site before using this application - otherwise, the webhook will try to add a license to a nonexistant account, which means the user won't get their key.

**Warning** At the moment, this is quite insecure, because anyone can send a POST request to this endpoint. The temporary remedy to this is allowing you to name your own route name, so it does not remain `keypler_gumroad`. If you do use the webhook, please set a custom, unique, route name to prevent users from verifiying themselves without paying.

## Todo

* Ability to generate multiple, distinguishable, keys per user