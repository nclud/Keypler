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


Keypler will automatically give each new user a `services.keypler` field, which has `license` set to `null` by default.

## Todo

* Configuration to use SendGrid's webhooks or GumRoad's
* Ability to generate multiple, distinguishable, keys per user
* Add more secure way to generate license, so users can't just run `Meteor.call('generateLicense', userId)` and magically have a license.