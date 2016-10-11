---
title: Setting up a modern webgl environment - part 1
date: 2016-10-10 21:23:57
tags: 
- webgl
- webpack
- babel
- es2015
- javascript
- node
categories:
- Coding
---
With modern browsers, node.js, and github, the javascript ecosystem has grown tremendously.  While the language is evolving, user adoption is lagging behind, so developers must make a choice: limit yourself to commonly adopted features (such as ES5), or use a build system to take advantage of modern features and 'compile' it down to ES5.

In this post, I'm going to describe how I setup the latter, specifically for making a website that is using WebGL. If you've been paying attention over the last few years, you will have noticed that there are plenty of options for javascript build system tools, and it can be confusing what to use and how to set it up so I'm going to focus on what I believe is the simplest system that gives you the most bang for your buck.

Specifically, in this and subsequent posts we're going build an environment that uses the following tools:
* git (for source control)
* node/npm (for package management)
* webpack (for bundling)
* babel (for es2017 transpiling)
* eslint (for static analysis)
* editorconfig (for editor settings)

Instead of just giving you a yeoman generator that drops a complicated build system in your lap, we're going to build it up piece by piece from scratch.

First, we need to decide how we're going to execute the build process.  For this, I think the choice is easy - Node.js. Your team is presumably already familiar with javascript, so writing the build system in javascript is a natural choice. Node also ships with a fantastic package manager (npm), so this will make it easy to pull in 3rd party dependencies like webpack and babel.

If you don't have it already, go ahead and install Node.js from https://nodejs.org/

We're going to be using github for source control, if you don't have it, you can get the client from https://desktop.github.com/

Now create a new github repro.  I typically do this from here https://github.com/new.

After creating the repo, you'll get a link that looks like this: https://github.com/brandf/brandf-environment-part1.git, only with your username/repro instead of mine.

Now open up a terminal and we'll setup a node package for our project.
{% codeblock lang:bash %}
> git clone <link_to_repo>
> cd <repo_name>
> npm init
{% endcodeblock %}

Answer the questions, and you'll have yourself a package.json file.  This is a manifest file that npm uses to track your projects dependencies, as well as other metadata in case you decide to publish this module to npm.

At this point there are several directions we could go - Grunt, Gulp, Browserify, etc are commonly used, but for this project I think Webpack is a great choice.  Webpack will do a few things for us 

1) it understands modules, and even node
packages, so you can easily write modular javascript and Webpack will bundle it all together into something that is easy
to consume in a browser.
2) It coordinates the execution of various other tools, which can transform your code.  We will
use this to write modern javascript and have it transpiled (via babel) down to ES5.

To setup webpack, we first need to install it via npm:
{% codeblock lang:bash %}
> npm install webpack --save-dev
{% endcodeblock %}

Then we're going to put the webpack configuration in a file called webpack.config.js:
{% codeblock lang:json webpack.config.js %}
module.exports = {
  entry: './src/app.js',
  output: {
    path: './bin/',
    publicPath: '/bin/',
    filename: 'bundle.js',
    sourceMapFilename: '[file].map',
    devtoolModuleFilenameTemplate: 'webpack:///[resource-path]?[loaders]',
  },
  devtool: 'source-map',
};
{% endcodeblock %}

This tells webpack that src/app.js is our entry point, and it will traverse all the module dependencies and bundle them up into bin/bundle.js. It will also produce source maps for bundle.js that let you debug the original source files rather than the generated bundle.js file.

For now we'll just make a placeholder entry point:
{% codeblock lang:bash %}
> mkdir ./src
> mkdir ./bin
> echo "document.write('hello world');" > ./src/app.js
{% endcodeblock %}

We can now build the bundle, to produce bin/bundle.js
{% codeblock lang:bash %}
> ./node_modules/.bin/webpack
{% endcodeblock %}
We run it out of the node modules so that we don't have any global dependencies except node.js.

To test this, we need to host the bundle in an html file:
{% codeblock lang:html index.html %}
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
  </head>
  <body>
    <canvas id="gl"></canvas>
    <script src="bin/bundle.js" charset="utf-8"></script>
  </body>
</html>
{% endcodeblock %}

Note that I put this in the root of the project to make it easy to use with github pages.  The canvas tag is what we will use later to render WebGL.

At this point you can open index.html in a browser and see that the javascript is running.  Better yet, we can locally host this as a website using the webpack dev server.  This can give you hot module swapping, which makes iterating really fast.

{% codeblock lang:bash %}
> npm install webpack-dev-server -save-dev
{% endcodeblock %}

To run with the dev server, try this:
{% codeblock lang:bash %}
> ./node_modules/.bin/webpack-dev-server --inline --hot --progress --colors --open
{% endcodeblock %}

This should open your browser for you, and if you make changes, the browser will automatically reload after you save so you can see the result instantly.
{% codeblock lang:javascript src/app.js %}
document.write('hot swap');
{% endcodeblock %}

Next let's move the webpack commands into package.json. Replace the existing script tag with this:
{% codeblock lang:json package.json %}
  "scripts": {
    "build": "./node_modules/.bin/webpack --progress --colors",
    "start": "./node_modules/.bin/webpack-dev-server --inline --hot --progress --colors --open"
  },
{% endcodeblock %}

This is a nice thing to do in case you publish this on npm.  Folks can just install your package, and build it without knowledge of the specific build tools you used. It's also easier to execute than digging into node_modules and remembering all the flags.

{% codeblock lang:bash %}
> npm run build
{% endcodeblock %}

Or to launch the dev server:

{% codeblock lang:bash %}
> npm run start
{% endcodeblock %}

Finally, let's check what we have into git.  We don't want to check in the node_modules though, so add a .gitignore file:
{% codeblock lang:bash %}
> echo "node_modules" > .gitignore
{% endcodeblock %}

And now, commit it to your repo.  We even commit ./bin/* because we want the project to work with github pages (more on this in another post).
{% codeblock lang:bash %}
> git add -A
> git commit -m "setup webpack and npm package"
> git push
{% endcodeblock %}

That's all for part 1.  You can find the end result here: https://github.com/brandf/brandf-environment-part1.git

In part 2 we'll hook up babel, eslint, and start writing some modern javascript code.