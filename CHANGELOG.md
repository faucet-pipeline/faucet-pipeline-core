faucet-pipeline-core version history
====================================

v1.2.2
------

_2019-06-17_

changes for end users:

* update browserslist

v1.2.1
------

_2019-05-02_

changes for end users:

* dropped support for Node 6
* improve handling of boolean CLI arguments
* update browserslist and nite-owl
* offer a `--serve` and `--liveserve` CLI option to serve the generated files
  via HTTP

improvements for developers:

* update mocha
* expose the `webRoot` in the manifest


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
