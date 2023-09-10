---
title: "The settings.php file for Drupal 9"
author: "Samuel J. Huskey"
date: 2021-06-08
tags:
  - Drupal
  - posts
image: "/assets/images/drupal.jpg"
layout: base
---

<!-- Excerpt Start -->

Here are some few useful tidbits I've learned about the `settings.php` file in my adventures with Drupal 8 and 9. All of this assumes that you are working on the command line and that your user is in the sudoers group.

<!-- Excerpt End -->

## First Steps

It's best to do the following things first:

1. Set up the files directory and give it the correct permissions: `cd SITE/web/sites/default && sudo mkdir files && sudo chown USERNAME:apache files && sudo chmod a+w files` **Note**: Change SITE and USERNAME to your site's name and your system username, respectively.
2. Create the settings.php file: `cp default.settings.php settings.php && sudo chown USERNAME:USERNAME settings.php && sudo chmod ug=rwx,o=rw settings.php`
3. Run install by going to the site at http://142.93.182.93/SITE/web/core/install.php.
4. Secure the permissions on settings.php: `sudo chmod u=rw,go=r settings.php && sudo chmod a=rwx files`
5. Make a private files directory: `cd` to the root of the installation and do `sudo mkdir private && sudo chown USERNAME:USERNAME private && sudo chmod a+w private`
6. Move the `config` directory out of `web/sites/default/files` and into the root of the site: `cd web/sites/default/files` and copy the name of the configuration file. Save that name because you'll need it a couple more times. `sudo cp -r config_HASH ../../../../config_HASH` (where HASH is the string appended to the config directory's name). After verifying that the config directory has been moved to the root of the site, do `sudo rm -rf config_HASH` inside of `web/sites/default/files`.

## The settings.php file

Change to the `web/sites/default` directory and open `settings.php` using your favorite text editor. I use Nano even though I know it some purists will insist that Vim is the only way to go. To them I say, "Whatever."

### Edit the "trusted_host_patterns"

Edit the `trusted_host_patterns` to include the root or host of your site. Using the find feature of your text editor, search for 'trusted_host', then enter the following in the space after the end of the commented portion:

```php
$settings['trusted_host_patterns'] = [
    '^YOUR_HOST_PATTERN_HERE$',
];
```

Observe that the value is a Regular Expression, so "^" and "$" are important for marking the beginning and ending point. You will also have to escape some characters. For example, `^myniftysite\.org$`.

### Tell Drupal where to find the private files directory

Search for "file_private_path" and add this after the end of the commented portion:

`$settings['file_private_path'] = $app_root . '/../private';`

That will tell Drupal to look outside of the web root for the private files directory.

### Tell Drupal where to find the config directory.

Search for "config_sync_directory" and add this after the end of the commented portion:

```php
$settings['config_sync_directory'] = $app_root . '/../config_HASH/sync';
```

Note that you must replace "HASH" here with the actual hash that is appended after "config\_". Don't for get to add "/sync", either!

### Generate a .htaccess file for the private files directory

Navigate in the browser to `admin/config/media/file-system` and click 'Save configuation' to generate the `.htaccess` file.

### If you are going to do a migration:

If you are going to do a migration, add the following at the end of your `settings.php` file to connect to the migration database. **NOTE**: It's important to name the key 'migrate'.

```php
$databases['migrate']['default'] = array (
  'database' => 'DBNAME',
  'username' => 'DBUSER',
  'password' => 'DBPASSWORD',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '3306',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
);
```

Of course, DBNAME, DBUSER, AND DBPASSWORD have to be replaced with real values.

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/es/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/drupal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
