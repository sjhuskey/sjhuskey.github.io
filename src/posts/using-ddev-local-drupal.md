---
title: "Using ddev for Local Drupal Development"
author: "Samuel J. Huskey"
date: "2022-10-06"
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - posts
layout: base
---

Setting up a local development version of a Drupal site has always been a challenge, since you need to have access to a database server and a PHP interpreter, not to mention various other tools (like [Drush](https://www.drush.org/)). After bad experiences with [MAMP](https://www.mamp.info/en/windows/) and [Virtual Box](https://www.virtualbox.org/), I switched to using a droplet at [Digital Ocean](https://www.digitalocean.com/) for any Drupal development projects. I love Digital Ocean's products and [tutorials](https://www.digitalocean.com/community/tutorials), but I've been telling myself that I have to become more proficient at using [Docker](https://www.docker.com/), so I decided to set up a Drupal container on my laptop and test it out.

## DDEV + Docker

Although there is an [official Docker image for Drupal](https://hub.docker.com/_/drupal/), it comes with a lot of provisos, and I didn't really want to deal with setting up a separate container for the db, PHP, and a volume for storage. That's why I was happy to find out about [ddev](https://ddev.com/), a development framework that does the heavy lifting of setting up Docker containers, etc., for you. It even has configurations for several popular Content Management Systems built in. What's not to love?

Even better, there's a [Digital Ocean Tutorial about setting up a Drupal 9 website on your local machine using Docker and ddev](https://www.digitalocean.com/community/tutorials/how-to-develop-a-drupal-9-website-on-your-local-machine-using-docker-and-ddev)!

The Digital Ocean tutorial and others that I found were great for setting up a new site, but I wanted to set up an existing site. That meant that I needed to learn how to tell ddev to use my existing database. I've written this post in case someone else runs into the same issue.

## Preparation

Before doing anything else, I had to log on to my Digital Ocean droplet and get the codebase and SQL file for the existing project. I made an SQL file of my database and a [tarball](https://www.howtogeek.com/362203/what-is-a-tar.gz-file-and-how-do-i-open-it/) of the codebase, and then I downloaded them into the `~/Sites` directory on my laptop.

The [Digital Ocean tutorial](https://www.digitalocean.com/community/tutorials/how-to-develop-a-drupal-9-website-on-your-local-machine-using-docker-and-ddev)'s "Prerequisites" section already tells you everything you need to know about installing Docker Desktop and ddev, so I won't repeat that information here.

## Setup

Using the Terminal, I navigated to the directory that was created when I unpacked the tarball that contained my site's files (i.e., `cd ~/Sites/dllmain`). It's important to run the following commands from the main directory for your site.

After I started Docker Desktop, I did `ddev config` in my site's main directory. That took me through a dialog that asked me questions about my site:

```bash
❯ ddev config
Creating a new ddev project config in the current directory (/Users/sjhuskey/Sites/dllmain)
Once completed, your configuration will be written to /Users/sjhuskey/Sites/dllmain/.ddev/config.yaml

Project name (dllmain):

The docroot is the directory from which your site is served.
This is a relative path from your project root at /Users/sjhuskey/Sites/dllmain
You may leave this value blank if your site files are in the project root
Docroot Location (current directory): web
Warning: the provided docroot at /Users/sjhuskey/Sites/dllmain/web does not currently exist.
Create docroot at /Users/sjhuskey/Sites/dllmain/web? [Y/n] (yes): Y
Created docroot at /Users/sjhuskey/Sites/dllmain/web.
Found a php codebase at /Users/sjhuskey/Sites/dllmain/web.
Project Type [backdrop, drupal10, drupal6, drupal7, drupal8, drupal9, laravel, magento, magento2, php, shopware6, typo3, wordpress] (php): drupal9
Ensuring write permissions for dllmain
No settings.php file exists, creating one
Existing settings.php file includes settings.ddev.php
Configuration complete. You may now run 'ddev start'.
```

1. Project name: I gave mine the name "dllmain". The name must conform to standard [hostname restrictions](https://en.wikipedia.org/wiki/Hostname#Restrictions_on_valid_hostnames), as I learned when I tried to use "digital_latin".
2. Docroot Location: I indicated `web`, since that's where all of the docs are for the site.
3. Project Type: ddev will attempt to identify the type of project it's dealing with and suggest an answer here. It correctly identified the codebase as a drupal9 project, so I used its answer.

## Initial Start

Since ddev said that I could run `ddev start`, I did. That step initializes all of the containers that will be used in the new local environment.

```bash
❯ ddev start
Starting dllmain...
Pushed mkcert rootca certs to ddev-global-cache/mkcert
Network ddev-dllmain_default  Created
Container ddev-dllmain-dba  Started
Container ddev-dllmain-db  Started
Container ddev-dllmain-web  Started
Container ddev-router  Started
Ensuring write permissions for dllmain
Existing settings.php file includes settings.ddev.php
Ensuring write permissions for dllmain
Successfully started dllmain
Project can be reached at https://dllmain.ddev.site https://127.0.0.1:56094
```

That last line says that the project can be reached at https://dllmain.ddev.site, but … my database wasn't available yet, so there would definitely be problems if I did that. Indeed, even if I had been working on a brand new site, I'd still need to run `ddev composer create "drupal/recommended-project"` to load all of the dependencies. Unfortunately, the tutorials I found online didn't cover how to import a new database.

## Importing the Database

When I ran `ddev start`, ddev started a database server in a container named "ddev-dllmain-db". For a moment, I thought that I would have to log on to that container and interact with MySQL there. I was happy to discover that ddev was several steps ahead of me. All I needed was a simple ddev command.

I moved the SQL file (digital_latin.bak.sql) for my database into the directory for my project, and then I entered this on the command line:

```bash
ddev mysql db < digital_latin.bak.sql
```

That imported the contents of digital_latin.bak.sql into the existing database ("db") that was already set up to be used by the Drupal codebase!

## White Screen of Death

I've come to accept as a given that the beginning of any Drupal project will have a bump or two. This case was no different.

I ran `ddev launch`, which should have opened a browser and displayed my site at https://dllmain.ddev.site. The browser opened, but it displayed the dreaded message "The website encountered an unexpected error. Please try again later."

That's not a very helpful error message, but that's nothing new with Drupal. It's a good thing that Drupal's user community is so helpful! After a quick search of that error message, I learned that I could add this line to the settings.php file to get more information:

```php
$config['system.logging']['error_level'] = 'verbose';
```

So I did that and discovered that my Radix subtheme was causing problems. After I reset the theme to Bartik (`ddev drush config-set system.theme default bartik`) and clearned the cache (`ddev drush cr`), my site was reachable.

Woohoo! Let the development begin!

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/es/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/drupal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
