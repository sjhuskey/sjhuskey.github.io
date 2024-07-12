---
title: "Rebuilding a Theme after Upgrading from Drupal 7 to Drupal 10: Introduction"
author: "Samuel J. Huskey"
date: "2024-06-23"
url: "/posts/upgrading-theme-intro"
description: "Notes on my process for rebuilding a theme from the ground up after upgrading a Drupal site from 7 to 10"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

For me, the worst part of upgrading a [Drupal](https://drupal.org/) site from 7 to the latest version (I've done upgrades to 8, 9, and 10) is rebuilding the theme. Since Drupal 8 introduced an entirely new theming framework, themes for Drupal 7 sites simply will not work on an upgraded site, so the only choices are to rebuild the theme from scratch or build a new one. Either way, if you're not a front-end developer or if you don't have the funds to pay one to do the work for you, this part of an upgrade can seem like an insurmountable obstacle.

I'm here to tell you that it's not. It's doable, if you have at least some familiarity with [CSS](https://www.w3.org/Style/CSS/) and [HTML](https://html.spec.whatwg.org/multipage/), and if you're willing to invest some time into learning [Bootstrap](https://getbootstrap.com/) and [Twig](https://twig.symfony.com/). To be honest, even if you don't know anything about those things, you can make a significant amount of progress with hints from Chat-GPT et al.

I have upgraded two Drupal 7 sites that had custom themes designed by a front-end development company that charged a lot of money (i.e., > $30,000). In both cases, I rebuilt the theme so that it strongly resembles the original D7 custom theme. Since I am by no means a graphic designer, that was the most direct path to getting the sites back online after the upgrade.

I decided to base the new themes on [Bootstrap](https://getbootstrap.com/), because it automagically takes care of a lot of the things I don't like to deal with in front-end development. Also, Bootstrap's [documentation is crystal clear](https://getbootstrap.com/docs/5.3/getting-started/introduction/), tutorials abound online (e.g., <https://www.w3schools.com/bootstrap/bootstrap_get_started.asp>), and the user community is huge—all factors I strongly consider when making any decisions about technology.

Since I know that other Digital Humanities folks have run up against the problem of doing front-end development with little or no funds, I figured I should write up some notes while I go through this process yet again with the DLL's Catalog site.

I'll add to this list as I finish writing up each step:

- [Rebuilding a Theme, Part I: Tricks and Tips](https://sjhuskey.info/posts/upgrading-theme-tips-tricks)
- [Rebuidling a Theme, Part II: Creating a Subtheme](https://sjhuskey.info/posts/upgrading-theme-part-2/)
- [Rebuilding a Theme, Part III: Working with Twig](https://sjhuskey.info/posts/upgrading-theme-part-3)
- [Rebuilding a Theme, Part IV: Working with Bootstrap](https://sjhuskey.info/posts/upgrading-theme-part-4)
- [Rebuilding a Theme, Part V: Customizing the Navbar](https://sjhuskey.info/posts/upgrading-theme-part-5)
