---
title: "Rebuilding A Theme, Part II: Creating a Subtheme"
author: "Samuel J. Huskey"
date: "2024-07-03"
url: "https://sjhuskey.info/posts/upgrading-theme-part-2"
description: "Notes on my process for rebuilding a theme from the ground up after upgrading a Drupal site from 7 to 10"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

## Install and Enable the Theme

There are several options for developing with Boostrap for Drupal. I have used [Radix](https://www.drupal.org/project/radix) before, and I liked it, but this time I want to use the [Bootstrap5](https://www.drupal.org/project/bootstrap5) theme because it isn't so heavily dependent on nodeJS.

So:

1. Install the Bootstrap5 theme: `composer require 'drupal/bootstrap5:^4.0'`
1. Enable the Bootstrap5 theme: `drush then bootstrap5`

The README file included in the theme also suggests installing the companion module [Bootstrap 5 tools](https://www.drupal.org/project/twbstools), but it doesn't have a stable release, and it hasn't been updated since 2022, so I'm not going to do that.

## Create a Subtheme

A subtheme allows developers to customize the theme without having all of their changes obliterated every time the theme is updated. The README provide a `drush` command: `drush --include="web/themes/contrib/bootstrap5/src/Drush" bootstrap5:generate-subtheme MACHINE_NAME --subtheme-name="SUBTHEME_NAME"`. Obviously, replace `MACHINE_NAME` with the machine name for the subtheme (I'm using `dll_catalog`) and `SUBTHEME_NAME` with a human-readable name (e.g., "DLL Catalog Theme").

If all goes well, there should now be a directory called `custom` inside of `web/themes`. There should also be a directory inside of `custom` with the machine name that was specified in the drush command.

## Enable the Subtheme and Set it as the Default

1. Enable the subtheme: `drush then dll_catalog` (or whatever the `SUBTHEME_NAME` is)
1. Set the subtheme as the default: `drush config-set system.theme default dll_catalog`

Now, clear the cache (`drush cr`), go to your browser, and pull up your site. The new subtheme should be in control. Here's a screen shot of mine at this stage:

![Screenshot of my bare subtheme](/assets/images/front-end/new-subtheme.png "New Subtheme"){.image}

Already I like this implementation of Bootstrap better than what I've found in Radix. Out of the box, as it were, the Bootstrap5 subtheme takes care of some things that I would have to handle with templates and CSS in Radix. Namely:

1. The content is centered in the browser window. It's not difficult to do that (see, for example, <https://mdbootstrap.com/docs/standard/layout/horizontal-alignment/>), but it's nice not to have to cope with it.
1. The footer is already pushed to the bottom of the browser window. That, too, can be dealt with easily, but I'd rather move on to other things.

As much as I like those things, it's time to customize my subtheme.
