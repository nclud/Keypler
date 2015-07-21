# Keypler

Automated API & License key generation, for Meteor!

## Usage

In the server's code, simply add `var keypler = new Keypler()` to instantiate Keypler. You can pass a configuration object - we'll document that more later.

Keypler will automatically give each new user a `services.keypler` field, which has `license` set to `null` by default.

## Todo

* Configuration to use SendGrid's webhooks or GumRoad's
* Let user customize authentication key's charset & length
* Ability to generate multiple, distinguishable, keys per user
* Ability to customize key's value, rather than set from `_id`