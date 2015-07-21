Package.describe({
  name: 'nclud:keypler',
  version: '0.0.1',
  summary: 'Automatically generate API & License keys, via email webhook',
  git: 'https://github.com/nclud/Keypler',
  documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.1.0.2');
  api.use('iron:router@1.0.0');
  api.use('accounts-base');
  api.use('jparker:crypto-sha1')
  api.addFiles('keypler.js');
  api.export('Keypler', 'server')
});

Package.onTest(function(api) {
  api.use('nclud:keypler');
});
