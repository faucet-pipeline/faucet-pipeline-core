faucet-pipeline-core version history
====================================


v2.2.0
------

_2025-10-31_

notable changes for end users:

* reduced the number of third-party dependencies

notable changes for developers:

* `faucetDispatch` now has a return value which reports completion of the
  initial build


v2.1.0
------

_2025-10-26_

notable changes for end users:

* added support for faucet-pipeline-assets and faucet-pipeline-css
* dropped support for Node 19 and below

no significant changes for developers


v2.0.0
------

_2023-01-12_

notable changes for end users:

* added support for faucet-pipeline-images

  `plugins: [require("faucet-pipeline-images")]` is no longer required within
  `faucet.config.js`

notable changes for developers:

* removed support for legacy plugin API

  all plugins are now expected to export `key`, `bucket` and `plugin`


v1.7.0
------

_2022-02-09_

maintenance release to update dependencies; no significant changes


v1.6.1
------

_2021-05-12_

notable changes for end users:

* fixed regression in Browserslist normalization

no significant changes for developers


v1.6.0
------

_2021-05-03_

notable changes for end users:

* dropped support for Node 10
* ensured Browserslist declarations within `package.json` support string values

no significant changes for developers


v1.5.1
------

_2021-03-19_

notable changes for end users:

* added support for resolving non-JavaScript package references

no significant changes for developers


v1.5.0
------

_2020-04-21_

notable changes for end users:

* configuration can now be asynchronous, i.e. `faucet.config.js` may export a
  promise, allowing for dynamically generated configuration values
* updated dependencies

no significant changes for developers


v1.4.0
------

_2020-03-16_

notable changes for end users:

* simplified use of custom plugins in configuration:

  ```javascript
  plugins: ["faucet-plugin-sample"]
  ```

notable changes for developers:

* plugins are now responsible for their own configuration (instead of relegating
  this to users' config file), exporting `{ key, bucket, plugin }` instead of
  just a function

  old-style plugins, while deprecated, are still supported though


v1.3.2
------

_2019-10-29_

notable changes for end users:

* improved host/port handling for `--server` and `--liveserve`

no significant changes for developers


v1.3.1
------

_2019-10-07_

notable changes for end users:

* fixed concurrent compilation
* fixed host/port handling for `--server` and `--liveserve`

no significant changes for developers


v1.3.0
------

_2019-09-02_

(this version was erroneously released as v1.2.x before, violating semantic
versioning)

notable changes for end users:

* dropped support for Node 6
* path resolution now expects non-relative paths (e.g. `my-lib/util.js`) to
  reside within `node_modules`
* added `--serve` and `--liveserve` CLI options to serve the generated files
  via HTTP
* improved handling of boolean CLI arguments

notable changes for developers:

* exposed `webRoot` in `Manifest`


v1.2.0
------

_2018-11-29_

notable changes for end users:

* ensured parent paths (i.e. `../`) are permitted where configuration expects
  relative paths
* ensured consistent manifest representation, avoiding changes due to arbitrary
  ordering

notable changes for developers:

* added `loadExtension` utility function to prompt for installation of missing
  packages
* added `reportFileStatus` utility function
* fixed `Manifest#toJSON` return value


v1.1.0
------

_2018-10-23_

notable changes for end users:

* `manifest.target` is now optional, defaulting to an in-memory manifest

notable changes for developers:

* added `resolvePath` utility function
