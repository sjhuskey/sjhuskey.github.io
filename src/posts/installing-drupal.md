---
title: "Installing Drupal"
author: "Samuel J. Huskey"
date: "2022-03-10"
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - posts
layout: base
---

## Assumptions

These directions assume that you already have ssh access to a server with a LAMP stack, that you have installed [Composer](https://getcomposer.org/download/) and that you are comfortable working on the command line.

## Create a new database and grant user privileges

1. Do `mysql -u USER -p` to get to the mysql prompt. Replace `USER` with your MySQL admin user name.
2. Create the database: `CREATE DATABASE databasename;` (replace `databasebame` with the name of your database).
3. Create a user for the database: `CREATE USER 'databaseuser'@'localhost' IDENTIFIED BY 'password';` (replace `databaseuser` and `password` with something)
4. Grant privileges: `GRANT ALL ON database.* TO 'databaseuser'@'localhost';`
5. `FLUSH PRIVILEGES;`
6. `exit`

## Set Up the Site's Root Directory

1. Navigate to the directory that Apache uses for its webroot. On Ubuntu and RHEL that's `cd /var/www/html`
2. Make a new directory for your site: `sudo mkdir my_site_name_dir`
3. Change the owner of the directory `sudo chown YOURUSERNAME:apache my_site_name_dir` (note that the Apache user is sometimes `www-data`)

## Use composer to create your drupal project:

`composer create-project drupal/recommended-project my_site_name_dir`

## Enable Version Control

1. Change into the site's directory: `cd my_site_name`
2. Initialize a git repository: `git init`
3. Add a .gitignore file (see my post on this subject [https://sjhuskey.info/drupal/gitignore-for-drupal/](https://sjhuskey.info/drupal/gitignore-for-drupal/))
4. Add the current files and commit.

## Set up the files directory and give it the correct permissions:

1. `cd my_site_name_dir/web/sites/default`
2. `sudo mkdir files`
3. `sudo chown YOURUSERNAME:apache files`
4. `sudo chmod a+w files`

## Set up the private files directory:

1. Navigate to the site's root (e.g., `cd my_site_name_dir`)
2. Make the private files directory: `sudo mkdir private`. Give the directory the correct owner and permissions: `sudo chown apache:apache private && sudo chmod a+w private`

## Create the settings file

1. Navigate to `my_site_name_dir/web/sites/default`
2. Copy the default settings file: `cp default.settings.php settings.php`
3. Change the ownership of the settings.php file: `sudo chown YOURUSERNAME:apache settings.php`
4. **TEMPORARILY** change the permissions on the settings.php file: `sudo chmod ug=rwx,o=rw settings.php`. You'll change the permissions again after the next step.

## Run the installer script

Run install by going to the address of the site in a browser. See [https://www.drupal.org/docs/user_guide/en/install-run.html](https://www.drupal.org/docs/user_guide/en/install-run.html) for more information.

1. Choose language: Select your language of preference and click "Save and Continue."
2. Choose profile: Select the standard profile and click "Save and Continue."
3. Set up database: Enter the credentials for the database you created earlier. Click "Save and Continue."
4. Watch the installer run!
5. Configure site: fill out the form. This creates user number one, which is the admin account for the site.

## Move the configuration directory

The installer script created a configuration directory at `web/sites/default/files`, but you should move it to the root of the installation for security purposes.

1. `cd web/sites/default/files`
2. Make note of the name of the configuration directory and save it because you'll need it a couple more times. The directory name will look something like `config_M_Mc2eRHKbh5P0w5JnsFmEhpio44nLb0enNXYIH6v4VtwvzqRnvuXpeyMNr4o2OeEPh07BvYCg`
3. Copy the config directory to the root of the installation: `sudo cp -r config_HASH ../../../../config_HASH && sudo chown sjhuskey:sjhuskey ../../../../config_HASH && sudo rm -rf config_HASH` (where HASH is the string appended to the config directory's name).

## Finish setting up the settings file

Navigate to `my_site_name_dir/web/sites/default` if you aren't already there.

### Edit the settings file

Use your favorite text editor (e.g., nano, vi) to make these changes to settings.php:

1. Search for 'trusted_host_patterns'. Insert your top-level domain into the trusted_host_patterns variable:

```php
$settings['trusted_host_patterns'] = [
    '^your\.domain\.name\.org$',
];
```

2. Search 'file_private_path', then edit:

```php
$settings['file_private_path'] = $app_root . '/../private';
```

3. Scroll to the end of the file. You'll see a block that defines your database connection. If you ever change the password for your database user, you'll need to change it here, too.

```php
$databases['migrate']['default'] = [
  'database' => 'YOUR-DATABASE-NAME',
  'username' => 'YOUR-DATABASE-USER-NAME',
  'password' => 'YOUR-DATABASE-USER-NAME-PASSWORD',
  'prefix' => '',
  'host' => 'localhost',
  'port' => '3306',
  'namespace' => 'Drupal\\Core\\Database\\Driver\\mysql',
  'driver' => 'mysql',
];
```

4. The last line of the settings file should be for the config_sync_directory, but it's no longer accurate after your moved the directory earlier, so edit it like so (replacing HASH with the hash for your config directory):

```css
$settings['config_sync_directory'] = $app_root . '/../config_HASH';
```

5. CHANGE THE PERMISSIONS on the settings.php file: `sudo chmod ug=r,o=-rwx settings.php` (doing `ls -la` after this should show that the permissions on settings.php are `-r--r-----`)
6. CHANGE THE PERMISSIONS on the files directory: `sudo chmod a=rwx files`

## Install drush

1. `composer require drush/drush && composer global require drush/drush && composer global update`
2. So that you can call drush just by typing `drush`, install ["Drush Launcher"](https://github.com/drush-ops/drush-launcher):
   a. Navigate to your user's home directory: `cd ~`
   b. `wget -O drush.phar https://github.com/drush-ops/drush-launcher/releases/latest/download/drush.phar`
   c. `chmod +x drush.phar`
   d. `sudo mv drush.phar /usr/local/bin/drush`
3. Navigate back to your site's root (e.g., `cd /var/www/html/my_site_name_dir`).
4. Clear your site's cache: `drush cr`

## Secure the Private Files Directory

In the site's UI, navigate to `admin/config/media/file-system` and click 'Save configuation' to generate the .htaccess file that will protect that directory. Back in the terminal, navigate to the private files directory and do `ls -la` to verify that the .htaccess file was created.

## Install Contributed Modules

To enhance the functionality of the site with contributed modules, you need to know the module's directory name on [drupal.org](https://drupal.org). To find the module's directory name, look at the end of the module's URL. For example, the Views module is at [https://www.drupal.org/project/feeds](https://www.drupal.org/project/feeds). The directory name is just `feeds`.

To install a module, use composer: `composer require drupal/module_directory_name`.

Then enable the module using drush: `drush en -y module_directory_name`

To uninstall a module:

1. `drush pm-uninstall module_directory_name`
2. `composer remove drupal/module_directory_name`

Here are the modules that I install on most of my sites:

- devel: indispensible for developing themes and modules
- feeds: import data from CSV or other formats
- google_analytics: the name speaks for itself :-)
- honeypot: excellent for keeping the bots away
- metatag: facilitates the publication of metadata for your site
- pathauto: automatically generates paths for your nodes
- redirect: again, speaks for itself
- search_api: more robust search than the search that comes with Drupal; also essential if you want to work with a Solr or Elastic Search instance)
- token: allows the use of variables in certain situations, making it much easier to apply changes globally, etc.
- token_filter: filter your tokens by context
- views_bulk_operations: allows you to edite multiple nodes all at once, among other things
- views_data_export: export your data in CSV, JSON, and other formats
<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/es/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/drupal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
