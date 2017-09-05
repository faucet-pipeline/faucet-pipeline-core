# faucet-pipeline

**tl;dr: faucet-pipeline is a framework-independent, pluggable asset pipeline
that takes the pain out of preprocessing JavaScript, CSS and associated files
(e.g. images or fonts). It simplifies the process of converting modern
JavaScript (ES6) to support older browsers (ES5), or Sass to CSS - eliminating
typical low-level configuration nightmares.**

* [Getting Started](#getting-started)
* [Description](#description)
* [Manifest Files & Integration with
  Frameworks](#manifest-files--integration-with-frameworks)
* [CLI](#cli)
* [Config File](#config-file)
* [Sponsors & Users](#sponsors--users)
* [Background](#background)
* [Troubleshooting / Frequently Asked Questions
  (FAQ)](#troubleshooting--frequently-asked-questions-faq)
* [License](#license)


## Getting Started

* install:

    ```
    $ npm install faucet-pipeline-js faucet-pipeline-sass
    ```

* configure ([learn more about this file](#config-file)):

    ```javascript
    let js = {
        manifest: {
            file: "dist/manifest-js.json",
            baseURI: "/assets"
        },
        bundles: [{
            entryPoint: "index.js",
            target: "dist/bundle.js",
            transpiler: {
                features: ["es2015"]
            }
        }]
    };

    let sass = {
        manifest: {
            file: "dist/manifest-css.json",
            baseURI: "/assets"
        },
        bundles: [{
            entryPoint: "index.scss",
            target: "dist/bundle.css"
        }]
    };


    module.exports = { js, sass };
    ```

* compile ([learn more about the CLI options](#cli)):

    ```
    $ node_modules/.bin/faucet
    ```

## Description

The faucet-pipeline is a command line application written in Node.js that takes
the development version of your assets to deliverable versions. By assets, we
mean files like JavaScript, CSS, image and font files. faucet-pipeline relies on
established tooling rather than reinventing the wheel, but provides a greatly
simplified, unified interface with reasonable defaults.

Why do the development versions of these files differ from their deliverable
version? For one, it is not uncommon to have your JavaScript distributed over a
lot of different files, but wanting to deliver a single (or a handful) of
JavaScript files to your client. You might also want to reduce the size of these
files by removing comments from them.  Or you might even want to translate them
from one language to another one (like Sass to CSS).

In addition, it is a good practice to fingerprint the assets you want to
deliver. That means that their file names change when the content changes. This
allows you to set the cache expiration date onto something far in the future
because when the file changes, this cache will not be used. Read more about it
in the Manifest Files section.

In development, you also might want to run this entire process every time a file
is changed that would change the result.

This is what faucet-pipeline does. And it does this by offering you different
modules (for example one for JavaScript and one for Sass) that you can choose
from depending on your project. It also allows you to do some configuration like
“Where are the files that need to be compiled?” or “Where should they be put?”,
but not much more. This reduces the amount of configuration you need to do
and allows us to switch out parts when newer, better parts become available
without you needing to change anything but the version number.

## Manifest Files & Integration with Frameworks

Each of the pipelines generates a manifest file. The manifest file provides
information about where to find the files. This is necessary as they are
fingerprinted. The file is in JSON and is an object.

The manifest looks like this:

```json
{
    "output/example.css": "/assets/output/example.css"
}
```

The key is the `target` of the according bundle. The value is dependent on your
manifest configuration:

1. If your `baseURI` is a String, it will be `${baseURI}${target}`
2. If your `baseURI` is a function, it will be the return value of your
   function (see [Config](#config-file) for details).

If you choose to use fingerprinting, then the right side will also be
fingerprinted. The idea is that in your Web app you provide a helper that is
provided with the key and will put out the value. You can then use it in your
template engine so that you don't need to hardcode the fingerprinted version.

A helper like this is currently available for the following
frameworks/languages:

* [Ruby on Rails](https://github.com/fejo-dk/rails_external_asset_pipeline):
  Full integration into helpers like `stylesheet_link_tag`.

If you've written another adapter, please open a PR to add it to the list.

## CLI

If you call the `faucet` command without any arguments, it will default to
building your project according to the configuration in the file `faucet.js` in
the current directory. You have the following options:

* `-c $FILENAME` or `--config=$FILENAME`: Use the file `$FILENAME` as the
  configuration file.
* `-w` or `--watch`: Build once, afterward watch for file changes and rebuild
  when a file that is used for one of your bundles changes.
* `--no-fingerprint`: Suppress fingerprinting in the file names.
* `--compact`: Use a compact output format for all pipelines that support it
  (currently faucet-pipeline-sass and faucet-pipeline-js). Comments will be
  stripped from the output etc. This doesn't do minification (variable name
  mangling etc.) due to our `view-source:` conviction.

We recommend that you use a combination of `--watch` and `--fingerprint` for
development (fingerprinting is not very useful in development and it also
reduces clutter on your disk) and `--compact` for production.

## Config File

The config file for faucet is a JavaScript file. In this file, you should export
an object that contains the configuration. For each pipeline you want to use,
you need to export an object with the according configuration. In addition, you
can do some general configuration of the file watcher. So it might look
something like this:

```js
module.exports = {
    js: {
      // configuration for faucet-pipeline-js
    },
    sass: {
      // configuration for faucet-pipeline-sass
    },
    watchDirs: {
        // configuration for file watching
    }
}
```

Each of the configurations is optional. If you don't want to use Sass, you could
only export a `js` option. The pipelines will only be required if you provided
an option for them. Therefore you would only need to install
`faucet-pipeline-js` in that case.

Each of the configurations (`js`, `sass`) requires a `manifest` configuration.
If you don't need a manifest file, set `manifest` to `false`. Otherwise, you
provide an object with two keys: `file` and `baseURI`. `file` is the path where
your manifest file should be written (relative to the config file). `baseURI`
can be either:

1. If your `baseURI` is a String, the manifest values will be generated
   like this: `${baseURI}${target}`
2. If your `baseURI` is a function, it will be the return value of your
   function. The function will be provided with two arguments: `target` and
   `path.basename(target)`.

For example, it could look like this:

```js
module.exports = {
	sass: {
		manifest: {
			file: "css.json",
			baseURI: "/assets"
		},
        // ...
    }
}
```

### Configuration for `faucet-pipeline-js`

The configuration has to include a `bundles` key with an array. Each entry of
the array if an object with two keys: `entryPoint` is the file that should be
compiled, and `target` is the file that should be created (the path is, of
course, modified a little when you use fingerprinting). It also has a third,
optional key `transpiler`. If you provide it, the pipeline will transpile ES201*
to ES3. You need to provide an object with a `transpiler` key that has an array
with features that you want to transpile as an argument.

If you for example want to transpile from ES2015 to ES3, your configuration
could look like this:

```js
module.exports = {
    js: {
        manifest: {
            file: "dist/manifest.json",
            baseURI: "/assets"
        },
        bundles: [{
            entryPoint: "index.js",
            target: "dist/bundle.js",
            transpiler: {
                features: ["es2015"]
            }
        }]
    };
};
```

### Configuration for `faucet-pipeline-sass`

The configuration has to include a `bundles` key with an array. Each entry of
the array if an object with two keys: `entryPoint` is the file that should be
compiled, and `target` is the file that should be created (the path is, of
course, modified a little when you use fingerprinting).

There are also two optional configurations:

* `assets`: If you want to use images or fonts in your CSS files that are also
  fingerprinted, you can provide an array of paths to manifest files here. You
  can then use the `asset-url` Sass function in your code. You provide the "left
  side" of your manifest file as an argument, and it will be replaced with
  `url(...)` with the dots being the "right side" of your manifest.
* `prefixes`: A configuration for the
  [autoprefixer](https://github.com/postcss/autoprefixer).

The resulting configuration could look something like this:

```js
module.exports = {
	sass: {
		manifest: {
			file: "./css.json",
			baseURI: "/assets"
		},
		assets: [
			"./images.json"
		],
		prefixes: {
			browsers: [
				"last 2 versions"
			]
		},
		bundles: [
			{
				entryPoint: "./example.scss",
				target: "output/example.css"
			},
			{
				entryPoint: "./example2.scss",
				target: "output/subfolder/example2.css"
			}
		]
	}
};
```

### Configuration for file watching

You don't need to configure anything for file watching. If you, however, want to
be gentle your file watching limit and your notebook charge, you might want to
restrict file watching to certain folders. Per default, it watches the entire
folder the config file is in. The configuration expects an array of strings. The
strings are paths relative to your configuration file. It could look like this:

```js
module.exports = {
    // ...
    watchDirs: ["src", "lib"]
}
```

## Sponsors & Users

The work on this project is sponsored by [innoQ](https://www.innoq.com) &
[fejo.dk](https://www.fejo.dk). It is used in production by the following
projects:

* [fejo.dk](https://www.fejo.dk)

## Background

For a while now, we've been advocating ES6 as we've become increasingly
convinced that it helps reduce cognitive load for JavaScript developers, thus
making code both more legible and modular.

However, even modern browsers don't fully
[support](http://kangax.github.io/compat-table/es6/) all the new features yet,
so getting started can be a bit daunting: We need a preprocessor
("[transpiler](https://en.wikipedia.org/wiki/Source-to-source_compiler)") to
translate ES6 into the more universally supported ES5 and also to combine
individual source-code modules into a single bundle. Unfortunately, getting this
right is often tricky — so much so that a commonly encountered sentiment is
"I'd like to use ES6, but haven't set up a transpiler yet".

Similarly, CSS preprocessors like Sass can provide the same benefits for the
styling side of web development, but can also be a hassle to set up.

In order to simplify the process, faucet takes care of all the minutiae,
providing the underlying infrastructure and reducing configuration to the bare
minimum required. With all that out of the way, we can focus on actually writing
the code. Thus we can easily recommend it to friends and colleagues and get them
started in less than a minute.

## Troubleshooting / Frequently Asked Questions (FAQ)

Q: error when importing a third-party library

this typically happens when importing a module which has already been bundled or
otherwise provides a distribution - the solution is to skip transpilation there:

```javascript
import jQuery from "jquery";
```
```javascript
    transpiler: {
        …
        exclude: ["jquery"]
    }
```

(NB: faucet assumes we're consuming ES6 modules by default)

Q: error (ENOSPC) when doing file watching on Linux

You probably reached the maximum value for watched files in inotify. This is
probably due to your `node_modules` folder. You should restrict your watcher to
only the folders that contain your SCSS/JS source files. [More
information](#configuration-for-file-watching)

## License

faucet-pipeline is licensed under Apache 2.0 License.
