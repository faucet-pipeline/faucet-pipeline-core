let projectRoot = process.argv[2];

let path = require.resolve("material-design-icons", { paths: [projectRoot] });
console.log("resolved:", path);
