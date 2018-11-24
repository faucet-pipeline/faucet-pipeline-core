faucet-pipeline-core version history
====================================


v1.2.0
------

_2018-11-29_

improvements for end users:

* ensured parent paths (i.e. `../`) are permitted where configuration expects
  relative paths
* ensured consistent manifest representation, avoiding changes due to arbitrary
  ordering

improvements for developers:

* added `loadExtension` utility function to prompt for installation of missing
  packages
* added `reportFileStatus` utility function
* fixed `Manifest#toJSON` return value


v1.1.0
------

_2018-10-23_

improvements for end users:

* `manifest.target` is now optional, defaulting to an in-memory manifest

improvements for developers:

* added `resolvePath` utility function
