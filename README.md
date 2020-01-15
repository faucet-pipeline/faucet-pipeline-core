test case for
[resolving implicit package names](https://github.com/faucet-pipeline/faucet-pipeline-static/issues/23)

1. `npm install`
2. `./test` should emit something like the following:

    ```
    project directory: /home/dev
    moving to /tmp
    resolved: /tmp/node_modules/material-design-icons/index.js
    ```
