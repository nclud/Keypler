# Keypler

Automated API & License key generation, for Meteor!

**Warning** Keypler is still in development and not completely finished. When it is, this message will be gone and Keypler will be available on Atmosphere.

## Usage

In the server's code, simply add `var yourKeypler = new Keypler(options)` to instantiate Keypler. See the **Configuration** section for details on how to use `options`.

To generate a new license, call `yourKeypler.generateLicense(userId)`. For security purposes, this method, along with the `Keypler` object, is only available on the server side.

## Configuration

The following table explains the fields, their defaults, and what they do.

| Field         | Type       | Default                                          | Description
| ------------- | ---------- | ------------------------------------------------ | ----------------------
| `publish`     | `boolean`  | true                                             | Defines whether or not Keypler will publish a user's license to the client side. This means users can see their license by looking at `Meteor.user().services.keypler.license`
| `makeLicense` | `function` | SHA or GUID function, depending on `licenseType` | A function which takes an argument of `userId` and returns a license key.
| `licenseType` | `String`   | `"sha"`                                          | The type of license to return. **Only to be defined if you do *not* define your own `makeLicense` function.** Options are `sha` and `guid`. Note: The `guid` function generated a random GUID. The `sha` function generates a SHA-1 hash based off of the userId salted with `Math.random() * Date.now()`
| `makeRoute`   | `boolean`  | true                                             | If `makeRoute` is set to true, Keypler will create a serverside route called `/keypler_verify` which can verify licenses

Keypler will automatically give each new user a `services.keypler.license` field, which has `license` set to `null` by default.

## Authentication

Keypler uses Iron Router to create a server route called `/keypler_verify` where external applications can authenticate. This route is created by default, but you can disable it by setting `makeRoute` to false in the configuration object.

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

## Todo

* Configuration to use SendGrid's webhooks or GumRoad's
* Ability to generate multiple, distinguishable, keys per user