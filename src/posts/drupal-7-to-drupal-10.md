---
title: "Upgrading the DLL Catalog Site to Drupal 10"
author: "Samuel J. Huskey"
date: "2024-05-25"
url: "https://sjhuskey.info/posts/drupal-7-to-drupal-10/"
description: "My experience of upgrading a Drupal 7 site to Drupal 10"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - posts
---

I finally have some time to devote to upgrading the [DLL Catalog](https://catalog.digitallatin.org/) from Drupal 7 to Drupal 10! I'm sharing some of the basic stuff here in case DH folks need to upgrade their sites.

I'm going to work on my upgrade project locally (i.e., on my laptop), using the fantastic [DDEV](https://ddev.com/) Docker-based tool so that I don't have to do it on a remote server or deal with MAMP or something like that. I strongly recommend using DDEV. There's [excellent documentation for installing it](https://ddev.com/get-started/), so I won't repeat it here.

After installing Docker and DDEV, the next step is to set up DDEV sites for both the existing Drupal 7 (D7) codebase and database and a new Drupal 10 codebase and database. Next, I'll install the migration modules. Finally, I'll run the migrations and troubleshoot.

## Setting up the DDEV Sites

### DLL Catalog (D7)

On my server, I made a copy of the codebase and database, then I used [`scp`](https://linuxize.com/post/how-to-use-scp-command-to-securely-transfer-files/) to copy those files to my local machine. I decompressed the codebase (`tar -xvf catalog.tar.gz`) and changed into the new directory (`cd catalog`). Then I configured that directory to use DDEV (`ddev config`) and told DDEV to import the SQL file I downloaded (`ddev mysql db < ../catalog.sql`). Et voilà: the DLL Catalog site is running locally on my laptop.

_Note that there is also a specific DDEV command for importing a database: `ddev import-db`. Read more at <https://ddev.readthedocs.io/en/stable/users/usage/managing-projects/#importing-a-database>_.

### Target Site (D10)

Spinning up a bare D10 site is remarkably easy, thanks to [DDEV's CMS quickstart directions for Drupal](https://ddev.readthedocs.io/en/stable/users/quickstart/#drupal).

## Prepare for Migration

### Install Migrate modules on the D10 site

This is easy. First, use Composer to require the migration modules in the D10 site. Note that I'm requiring not only Migrate Upgrade and Migrate Plus, but also Migrate Tools and Migrate File, since experience tells me that I'll avoid errors on import with those installed:

```bash
# Require the migrate modules
ddev composer require drupal/migrate_tools drupal/migrate_upgrade drupal/migrate_plus drupal/migrate_file
# Install the migrate modules
ddev drush en -y migrate_tools,migrate_upgrade,migrate_plus,migrate_file
```

### Install Contributed Modules on the D10 site

For this step, the easiest thing to do is to install the [Upgrade Status](https://www.drupal.org/project/upgrade_status) module on the D7 site, enable it, and run its report. That will tell you which contributed modules on the D7 site have versions that are compatible with D10.

Make note of the modules that are not compatible and begin thinking about whether you need to find an alternative. In my case, I wrote some custom modules that I'll need to upgrade, but that's not a crucial detail at this stage.

For the modules that do have compatible versions, ask whether you'll need their functionality on the D10 site. If the answer is yes, then install and enable them.

### Define the Migration Source Database

Since I'm migrating content from one Docker container into another, the two need to be able to communicate. Fortunately for all of us, the Drupal community has [some good tips](https://www.drupal.org/docs/upgrading-drupal/upgrading-from-drupal-6-or-drupal-7/upgrade-using-drush#s-define-the-source-database) about this:

> Start up both the source web site (Drupal 7) and target web site (Drupal 10) in separate DDEV instances. Enter the D7 credentials in the Drupal 10 `settings.php`, using the Docker containers listed during start up, for example `ddev-drupal7-db` and `ddev-drupal7-web`, shown during start up.

If you weren't paying that much attention during startup, you can use `docker ps` to find the container names. Here's the truncated output from when I ran that command:

```bash
f5690a2779de ddev-catalog-web
84540cbad1c5 ddev-catalog-db
ac6dc2c61ffa ddev-router
881cf19e2de0 ddev-d10catalog-db
38103ba38a87 ddev-d10catalog-web
70200fafaac5 ddev-ssh-agent
```

Here's what I entered into my d10catalog site's `settings.php`, following the [Example values for DDEV](https://www.drupal.org/docs/upgrading-drupal/upgrading-from-drupal-6-or-drupal-7/upgrade-using-web-browser#s-example-values-for-ddev):

```php
$settings['migrate_source_connection'] = 'migrate';
$settings['migrate_source_version'] = '7';
$settings['migrate_file_public_path'] = 'http://catalog.ddev.site/';
$settings['migrate_file_private_path'] = '';

$databases['migrate']['default'] = [
  'database' => 'db',
  'username' => 'db',
  'password' => 'db',
  'host' => 'ddev-catalog-db',
  'port' => '3306',
  'driver' => 'mysql',
  'prefix' => '',
];
```

Be sure to clear the cache with `ddev drush cr` after making this update to `settings.php`.

## Make a Custom Module for the Migration

I have found that it makes sense in the long run to make a custom module for your migration. It's easier than you think.🤠

### Set up the Structure for your Module

1. Switch into `web/modules` in your D10 site
1. If you don't already have a `custom` directory, make one: `mkdir custom`
1. Switch into `custom` and create a new directory for your custom module (e.g., `cd custom && mkdir my_migration`)
1. Switch into your custom migration module
1. Make an `info.yml` file. Mine is `catalog_migrate.info.yml`. Change the first part of the file's name to whatever you're calling your module.
1. Add the following contents to the `info.yml` file:

```yml
type: module
name: Catalog D7 to D10 Migration Module
description: "A module for migrating content from a legacy site to a new one."
package: Custom
core: 10.x
core_version_requirement: ^10
dependencies:
  - drupal:migrate
  - drupal:migrate_drupal
  - drupal:migrate_plus
  - drupal:migrate_tools
```

Now make the directories for the migration files you'll generate in the next step:

1. Make a directory called `config` (`mkdir config`).
1. Switch into `config` and make a new directory called `install` (`mkdir install`)

### Generate the Migration Files

The `drush migrate:upgrade` command will generate the files needed for the custom module. Certain things have to be done to make it work on a DDEV site. Specifically, the values in the `--legacy-db-url` extension have to use the database user, password, Docker name, and database name that I used to make the connection in `settings.php`. The `legacy-root` value should be the absolute path to the D7 site; in my case, it's `/Users/sjhuskey/Sites/catalog`. If you need help finding the absolute path, use `cd` to navigate to your D7 site's root, then execute `pwd` (print name of working directory) to get the absolute path.

Taking those items into consideration, this is the command I ran to generate the migration files:

```bash
ddev drush migrate:upgrade --legacy-db-url=mysql://db:db@ddev-catalog-db/db --legacy-root=/Users/sjhuskey/Sites/catalog/sites/default/files --configure-only
```

### Export the Migration Files

After running the `drush migrate:upgrade` command above, I ran the following command to export the files needed for migration to a `tmp` directoy I created in the root directory of the site:

```bash
ddev drush cex --destination=../tmp
```

`../tmp` changes from the `web` directory to the parent or root directory.

If you don't add the `--destination` flag, the files will end up in your `sync` file, and when you try to activate your custom module later, you'll get an error.

### Copy the Migration Files into your Custom Module

When I did `ddev drush cex` in the previous step, the configuration files for EVERYTHING were added to the temporary directory. I just need the migration config files, so I changed into the directory at `/Users/sjhuskey/Desktop/tmp` and executed the following command to copy only the migration config files to my custom module's `config/install` directory:

```bash
cp migrate_plus.migration.* migrate_plus.migration_group.migrate_*.yml ~/Sites/d10catalog/web/modules/custom/catalog_migrate/config/install
```

Now I have a bunch of files with names like `migrate_plus.migration.upgrade_d7_action.yml` in my module's `config/install` directory. Great!

### Modify the Names of the Migration Files

First things first: change the name of `migrate_plus.migration_group.migrate_drupal_7.yml` to `migrate_plus.migration_group.my_module.yml`.

```bash
mv migrate_plus.migration_group.migrate_drupal_7.yml migrate_plus.migration_group.catalog_migrate.yml
```

This file will define the group for your migration.

I need to replace `upgrade_d7` in the file names with the name of my module. Since dozens of files need that change, I wrote a Python script to do it for me:

```python
#!/usr/bin/env python
# coding: utf-8

import os
[os.rename(f, f.replace('upgrade_d7', 'catalog_migrate')) for f in os.listdir('.') if not f.startswith('.')]
```

As always, if you're following along, replace `catalog_migrate` with the name of your custom module.

I named the file `rename.py` and placed it in my custom module's `config/install` directory. I ran it with `python3 rename.py`. Shazam! All of my files have been renamed.

### Remove Unneeded Files

Remove `migrate_plus.migration.catalog_migrate_action.yml` and `migrate_plus.migration.upgrade_action_settings.yml`. From past experience, I know that they cause trouble.

### Edit the Migration Config Files

Several find/replace operations are needed across all the migration config files. The command line tool `sed` is great for this:

```bash
for file in *; do
    sed -i '' -e '/^uuid: [0-9a-z\-]*$/d' \
        -e 's/migration_group: migrate_drupal_7/migration_group: catalog_migrate/' \
        -e 's/id: upgrade_d7/id: catalog_migrate/' \
        -e 's/upgrade_d7/catalog_migrate/' "$file"
done
```

Breaking that down, I'm using a `for` loop in bash to iterate over the files and perform the following operations:

1. All of the migration files contain a uuid that must be removed. I'm using the Regular Expression `^uuid: [0-9a-z\-]*$/d` to match the pattern and delete the line
1. Change `migration_group: migrate_drupal_7` to the `migration_group: catalog_migrate`
1. Change `id: upgrade_d7` to `id: catalog_migrate`
1. Change remaining instances of `upgrade_d7` to `catalog_migrate`

This can be done in a text editor with "Find and Replace in Files", too. Be sure to change `catalog_migrate` to the name of your module.

### Edit the Migration Group YAML file

Update the content of `migrate_plus.migration_group.catalog_migrate.yml`. Prior to editing, mine looks like this:

```yaml
langcode: en
status: true
dependencies: {}
id: migrate_drupal_7
label: "Import from Drupal 7"
description: "Migrations originally generated from drush migrate-upgrade --configure-only"
source_type: "Drupal 7"
module: null
shared_configuration:
  source:
    key: drupal_7
    database:
      driver: mysql
      username: db
      password: db
      host: ddev-catalog-db
      port: ""
      database: db
      prefix: null
```

I edited it to this (changes commented):

```yaml
langcode: en
status: true
dependencies: {}
id: catalog_migrate # Change the id to the machine name of the module
label: "Import from Catalog D7 site" # Change the label.
description: "Migrations originally generated from drush migrate-upgrade --configure-only"
source_type: "Drupal 7"
module: null
shared_configuration:
  source:
    key: migrate # Change this to "migrate"
    database:
      driver: mysql
      username: db
      password: db
      host: ddev-catalog-db
      port: ""
      database: db
      prefix: null
```

## Install the Module

Install the module with `ddev drush en -y catalog_migrate`. If all goes well, the module is enabled and I can move on to the next step.

## Check Migration Status

If you run `ddev drush migrate:status`, you're likely to see a bunch of scary error messages related to Drupal 6 migrations that are included by default. To avoid seeing those, do `ddev drush migrate:status --group=catalog_migrate`. I did that and found that my migrations were looking good: all were idle, with expected numbers in the `Total`, `Imported`, and `Unprocessed` columns.

## Running the Migration

I wish there were a `--simulate` flag so that I could run a test migration without actually importing a bunch of stuff into my D10 site, but there isn't. So, now's the time to run `ddev drush migrate:import --group=catalog_migrate --continue-on-failure`. I use the `continue-on-failure` flag because otherwise the process stops every time there's even a minor issue. There probably will be some issues, but I prefer to find out how extensive the issues are by watching all of the migrations complete their run.

## Debugging

I have never seen a migration executed flawlessly on the first run. It's good to know some debugging tips.

Drush does a good job of letting you know when there are problems. For example, my migration produced this message:

```bash
[notice] Processed 327 items (315 created, 0 updated, 12 failed, 0 ignored) - done with 'catalog_migrate_field_formatter_settings'
[error]  catalog_migrate_field_formatter_settings Migration - 12 failed.
```

The `migrate:message` (`mmsg`) command, with the name of the troublesome migration, will provide more information: `ddev drush mmsg catalog_migrate_field_formatter_settings`. Running that told me that most of the issues had to do with field format widgets that were supplied by the [Autocomplete Widgets](https://www.drupal.org/project/autocomplete_widgets) module, which does not have a D10 version.

If there are issues with other migrations, now is the time to use `mmsg` with those, too. Otherwise, the messages will disappear after you run `migrate:rollback` (`mr`) to, well, roll back the migration.

Sometimes, when a migration stops in the middle of the operation, it's necessary to use `migrate:reset-status` (`mrs`) to reset a migration.

To resolve the issues, I work in the site's `sync` directory, which DDEV puts in `web/sites/default/files/sync`. I edit the files that correspond to the migrations that had problems, then I do `ddev drush cim` to import the changes, followed by `ddev drush cr` to clear the caches.

Finally, I run `migrate:import` (`mim`) again with the `--group` and `--continue-on-failure` flags, watching for the same or new error messages. It might be the case that you will have to live with some of the minor issues that don't affect the content or functionality of your site.

## Next Step: Rebuilding the Theme

This is the really unfortunate part of upgrading a Drupal 7 site. Drupal 8 introduced an entirely new theming layer, so I'll need to rebuild the theme in Twig before I can launch the new version. For now, everything will be done locally on my DDEV site. I'll post something about my adventures with rebuilding the theme.
