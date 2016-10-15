---
title: Setting up a modern webgl environment - part 2
date: 2016-10-14 22:52:57
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
In the last post we began to setup a modern javascript build system. If you didn't read it, you can catch up here:

https://brandf.github.io/2016/10/10/modern-webgl-environment-part1/

In this post we're going to continue and setup babel, eslint, and editorconfig. At that point you'll have an awesome environment to create the next great web app.

If you were following along in par1, you can continue where we left off, otherwise clone this repo to catch up:

https://github.com/brandf/brandf-environment-part1.git

The first thing we're going to do is setup an editor config. This is nice to have in an open source project because you don't know what editor folks are going to use, and so this is a common way to describe what settings they should use.

Simply create a file named .editorconfig that looks like this:
{% codeblock lang:ini .editorconfig %}
# http://EditorConfig.org
root = true

[*]
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
charset = utf-8
indent_style = space
indent_size = 2
{% endcodeblock %}

I'm using Visual Studio Code, which doesn't support .editorconfig out of the box, so I needed to install an extension.  Hit Ctrl+P, and type "ext EditorConfig" to open the extensions. Install "EditorConfig for VS Code".

Now you can test it out by modifying a file to have a trailing space, or no new line, and see if it trims when you save.

Next let's install a transpiler called Babel.  Babel lets you write modern javascript, and compile it down to older javascript (most likely ES5).  Babel also acts as a platform for various other language extensions such as JSX (more on this in a future post).

First we need to get the babel package from npm:
{% codeblock lang:bash %}
> npm install --save-dev babel-core
{% endcodeblock %}

Now we could kick it off manually, but we already have webpack setup so let's have webpack run babel on all javascript files as part of the bundling process.

The babel loader module does this for us:
{% codeblock lang:bash %}
> npm install --save-dev babel-loader
{% endcodeblock %}

Next we need to setup webpack to use the loader. Add this to the webpack config:
{% codeblock lang:javascript webpack.config.js %}
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel'],
      },
    ],
  },
{% endcodeblock %}

At this point, babel will run, but it doesn't do much unless we tell it what transformations we want.  To do this, we need a babel config file:
{% codeblock lang:bash %}
> echo '{ "presets": ["latest"], "plugins": ["transform-runtime"] }' > .babelrc
{% endcodeblock %}

Next install the package for the preset and plugin:
{% codeblock lang:bash %}
> npm install babel-preset-latest --save-dev
> npm install babel-plugin-transform-runtime --save-dev
{% endcodeblock %}

At the time of this writing, the 'latest' preset brings in es2015, es2016, and es2017 language features. The transform plugin is needed to make generators/async work. Now it's time to write some modern javascript!

Replace your app.js with this:
{% codeblock lang:javascript src/app.js %}
class Foo {
  static async doIt() {
    for (let i = 0; i < 10; i++) {
      await Foo.delay(1);
      document.body.appendChild(document.createTextNode(i));
    }
  }
  static delay(seconds) {
    return new Promise((res) => {
      setTimeout(() => {
        res();
      }, seconds * 1000);
    });
  }
}
Foo.doIt();
{% endcodeblock %}

The above is just some toy code to exercise javascript classes (from es2015) and async methods (from es2017).

To see it in action, just launch the server
{% codeblock lang:bash %}
> npm run start
{% endcodeblock %}

You can play around with it while the server is running and it will reload every time you save.

Now that we're writing javascript, we'll soon get annoyed by simple typos causing bugs that aren't discovered until runtime. YAY dynamic languages. One way to combat this is with static analysis. Since we already have a build step for bundling, we would like to find out about common mistakes at build time instead of runtime.

eslint is great for this. Not only does it find mistakes like typos, but it also keeps the code clean/consistent by enforcing coding standards such as brace style, naming conventions, etc.
{% codeblock lang:bash %}
> npm install eslint-loader --save-dev
{% endcodeblock %}

And then we need to add it to our loaders list.  Make sure it's the right-most loader so it runs first.
{% codeblock lang:javascript webpack.config.js %}
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loaders: ['babel', 'eslint'],
      },
    ],
  },
{% endcodeblock %}

Similar to how we configured babel, we're going to configure eslint with .eslintrc.  You can use different rules to suit your taste, but the airbnb set are a good starting point.
{% codeblock lang:bash %}
npm install eslint-config-airbnb --save-dev
{% endcodeblock %}

{% codeblock lang:json .eslintrc %}
{
  "extends": "airbnb",
  "rules": {
    "no-plusplus": "off",
    "no-param-reassign": ["error", { "props": false }]
  },
  "env": {
    "browser": true
  }
}
{% endcodeblock %}
Note that I customized a few rules on top of airbnb.

Now when we build, we will get warnings/errors if our code violates the rules.  At that point you have two options 1) fix the issues 2) override the rule. Sometimes it makes sense to override it because you know what you're doing and the rule is to prevent something accedental like using | instead of ||.  One way to override it is to do something like this:

{% codeblock lang:javascript %}
  // eslint-disable-next-line no-bitwise
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
{% endcodeblock %}

Similar to editorconfig, you may want to setup your editor to run eslint. To do that in visual studio code, you type CTRL+P, then "ext ESLint", and install it.  You may also need to install the package globally

{% codeblock lang:bash %}
> npm install eslint -g
{% endcodeblock %}

You may need to close/reopen VS Code, and now you'll get red squiggles every time you violate an eslint rule.  Try adding a space between a function and it's opening param...bad developer!

That's all for part 2.  We now have a pretty sophisticated build environment that lets us use the latest language features while still being able to target common browsers. 

You can find the end result here: https://github.com/brandf/brandf-environment-part2.git

In part 3 we'll add some packages to help use WebGL and some babel loaders that help us with CSS and GLSL.