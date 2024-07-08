---
title: "Rebuilding A Theme: Tricks and Tips"
author: "Samuel J. Huskey"
date: "2024-07-02"
url: "https://sjhuskey.info/posts/upgrading-theme-tips-tricks"
description: "Some basic information to know before starting a front-end development project in Drupal"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

Before I start blogging about the specifics of my front-end development project, I thought I should list some things I've picked up over time about theming in Drupal.

## Develop with DDEV

I do all my Drupal development work using [DDEV](https://ddev.com/) to run the site locally. See my post [Using ddev for Local Drupal Development](https://sjhuskey.info/posts/using-ddev-local-drupal/) for more information on using DDEV. It is so much better than the bad old days of using MAMP or a Virtual Machine!

But since not everyone uses DDEV, I'm going to leave `ddev` off of several of the commands that I will mention in this series, lest I create confusion.

## Use Your Browser's Development Tools

My main web browser is [Firefox](https://www.mozilla.org/en-US/firefox/new/), which has great Web Developer Tools available in Tools > Browser Tools > Web Developer Tools. These tools are essential for inspecting a page's code to identify what, exactly, needs to be selected for styling. There's also an interface for seeing how your page looks on different devices.

On a Mac, the shortcut for activating the tools in Firefox is `⌘⌥c` (command + option + c). I recommend memorizing what the shortcut is in your browser, since you'll need to use it a lot. I'll go so far as to say that you shouldn't even think about front-end development without figuring out how to use your browser's web development tools!

## Install a CSS compiler

In my case, the theme I'll be working with uses SASS, which stands for "Syntactically Awesome Style Sheets." According to the [website](https://sass-lang.com/), "Sass is the most mature, stable, and powerful professional grade CSS extension language in the world." Installation instructions are at <https://sass-lang.com/install/>. In my case, I'll use Homebrew to install it on my Mac: `brew install sass/sass/sass`.

In some cases, [npm](https://www.npmjs.com/) takes care of this step.

## Set Up Drupal for Theme Development

First of all, install the [Twig Tweak module](https://www.drupal.org/project/twig_tweak). It adds a bunch of functionality that you'll probably want or need.

Twig is the default templating language for Drupal since version 8. In addition to being more user-friendly than the raw PHP of earlier versions of Drupal, Twig has some really helpful hinting and debugging features. To take advantage of these, you need to edit a couple of files in the `web/sites/default` directory.

### Turn on Twig Debugging

1. Go to `web/sites/default`
1. Copy `default.services.yml` and name the copy `services.yml`: `cp default.services.yml services.yml`
1. Open `services.yml`
1. Scroll down to the section `twig.config`
1. Change the line `debug: false` to `debug: true`
1. Save and close

### Enable Local Settings

The local settings file adds some development tools.

1. Go to `web/sites/default`
1. Copy `example.settings.local.php` and rename it `settings.local.php`: `cp example.settings.local.php settings.local.php`

Now, edit `settings.php` to tell Drupal to use the `settings.local.php` file. You might have to change the permissions on `settings.php` before you edit it. If you do have to change the permissions:

1. Navigate to `web/sites/default`
1. Do `chmod ug=rwx settings.php`

Now, do the following:

1. Open `settings.php`
1. Scroll down to the bottom of the file
1. Uncomment the last lines by deleting the `#` sign at the beginning of each line

The final lines of `settings.php` should now look like this:

```php
if (file_exists($app_root . '/' . $site_path . '/settings.local.php')) {
   include $app_root . '/' . $site_path . '/settings.local.php';
}
```

Don't forget to reset the permissions on `settings.php`: `chmod ug=r,o= settings.php`.

Be sure to clear the caches: `drush cr`.
