faucet-pipeline-core
====================

[![npm](https://img.shields.io/npm/v/faucet-pipeline-core.svg)](https://www.npmjs.com/package/faucet-pipeline-core)
[![build status](https://github.com/faucet-pipeline/faucet-pipeline-core/workflows/tests/badge.svg)](https://github.com/faucet-pipeline/faucet-pipeline-core/actions)
[![Greenkeeper badge](https://badges.greenkeeper.io/faucet-pipeline/faucet-pipeline-core.svg)](https://greenkeeper.io)

See [faucet-pipeline.org](https://www.faucet-pipeline.org) for documentation.


License
-------

faucet-pipeline is licensed under the Apache 2.0 License.


Contributing
------------

* ensure [Node](https://nodejs.org) is installed
* `npm install` downloads dependencies
* `npm test` runs the test suite and checks code for stylistic consistency


Releases
--------

NB: version numbers are incremented in accordance with
    [semantic versioning](https://semver.org)

1. update version number in `package.json`
2. update `CHANGELOG.md`
3. commit as "v#.#.#"

        $ git commit -m "v`node -p -e 'require("./package.json").version'`"

4. `./release` publishes the new version
