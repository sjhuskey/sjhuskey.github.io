---
title: "Migrating the Digital Latin Library from Drupal 7 to Drupal 9"
author: "Samuel J. Huskey"
date: 2021-10-04
tags:
  - Drupal
  - Digital Latin Library
  - posts
image: "/assets/images/drupal.jpg"
layout: base
---

# Background

I manage several sites that have been running on [Drupal 7](https://drupal.org/). For a variety of reasons, I finally decided that it was time to upgrade them to Drupal 9. I wanted to bypass Drupal 8 altogether, since its end-of-life is coming up in November 2021. Previously, the upgrade path required a detour through D8, but now it's possible (theoretically) to go straight to D9, so that's what I planned to do.

My first migration adventure was with [https://digitallatin.org/](https://digitallatin.org/), the main informational site for the Digital Latin Library. I selected that one because it's a pretty simple site: a couple of custom content types and fields, no custom modules, very few users, and hardly any bells or whistles. I figured that migrating a simple site would prepare me for dealing with the more complex [https://catalog.digitallatin.org/](https://catalog.digitallatin.org/) later.

I'm going to include some command line stuff here, along with more general observations and notes, in the hope that this information will help someone else.

Just for context, I am working on a droplet at [Digital Ocean](https://www.digitalocean.com/) running CentOS 7. That means it has MariaDB instead of MySQL, but otherwise everything is pretty standard. I am also using [Composer](https://getcomposer.org/) (version 2.1.3) for managing the Drupal codebase.

## Edit the settings.php file

Make these changes to settings.php.

1. Navigate to `web/sites/default`.
2. Open `settings.php` using your favorite text editor.
3. Search for 'trusted_host' and insert the following after the end of the commented section for that setting:

```php
$settings['trusted_host_patterns'] = [
    INSERT_YOUR_HOST_PATTERN_HERE
];
```

4. Search 'file_private' and insert the following after the end of the commented section for that setting: `$settings['file_private_path'] = $app_root . '/../private';`
5. Search 'config_sync_directory' and insert the following after the end of the commented section for that setting:
   `$settings['config_sync_directory'] = $app_root . '/../DIRECTORYFROMSTEP8/sync';`
6. At end of file add connection to migration database. **NOTE** It's important to name the key 'migrate'.

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

After these steps, navigate in the browser to `admin/config/media/file-system` and click 'Save configuation' to generate the .htaccess file.

# Set up Git

Now is a good time to set up Git so that you can track your work.

1. Add a `.gitignore` file to the root directory. Go to <https://sjhuskey.info/drupal/gitignore-for-drupal/> for a good one. 🤓
2. Initiate a git repository: `git init`
3. Add files to repository: `git add .`
4. Commit: `git commit -m "First commit."`

# Install and Enable Migrate Tools

I have encountered difficulties with installing the essential migration tools, since there are multiple conflicts between the Drupal core version, Drush version, and the various migrate modules. I have found it best to install the the migrate modules with Composer first (i.e., before installing Drush) and enable them with the UI (obviously, since Drush isn't installed yet). Note that `--with-all-dependencies` will install the right version of Drush, since Drush is a dependency of the migrate modules.

1. `cd` to the root site directory.
2. Install and enable migrate tools: `composer require drupal/migrate_tools drupal/migrate_upgrade drupal/migrate_plus drupal/migrate_file --with-all-dependencies.`

# Evaluate Modules Installed on Original Site

1. Run the command `sudo drush pm-list --type=Module --no-core --status=enabled > ~/SITENAME-modules.txt` to save a list of all of the enabled contributed and custom modules to a text file in the user's home directory.
2. Download that file: `scp USERNAME@SERVERNAME:~/SITENAME-modules.txt Directory-of-your-choice`
3. Review the list to see if there are Drupal 9 equivalents.
4. Install equivalents using Composer.
5. Enable the modules with Drush.

It's important to do these steps so that the modules are taken into account when you generate the migration files.

# Commit everything to the Git repository

At this point, it's a good idea to commit your changes to the Git repository.

1. `git add .`
2. `git commit -m "Added modules before starting to build the migration."`
3. `git push` (if you have a remote repository)

# Generate the Migration YAML files

In this step, you'll generate YAML migration files without actually running the migration (that's what `--configure-only` does).

From the root of the site, run `drush migrate-upgrade --configure-only --legacy-db-key=migrate --legacy-root=[INSERT THE ROOT DOMAIN OF YOUR SITE HERE]/`

Now, so that you'll have a copy of all of the files to review offline with a good text editor, do the following:

1. Copy the config files to a directory called `migrate` in the `/tmp` directory: `drush config:export --destination=/tmp/migrate`
2. Copy only the files having to do with migration to a directory called `migrate_files` within your user's home directory: `mkdir ~/migrate_files && cp /tmp/migrate/migrate_plus.migration.* /tmp/migrate/migrate_plus.migration_group.migrate_*.yml ~/migrate_files`
3. Download that directory to your computer: `scp -r USERNAME@SERVERNAME:~/SITENAME_migrate_files DIRECTORY_ON_YOUR_COMPUTER`

# Run the Migrations

Back in the root directory of the Drupal codebase, do the following:

1. `drush migrate:import --tag=Configuration --execute-dependencies`
2. `drush migrate:import --tag=Content --execute-dependencies`

It is very likely that there will be errors with one or both of these steps. At this point, debugging is the name of the game.

# Errors and Solutions

## Inline Entity Form

I ran into the error `The "inline_entity_form_field_instance_settings" plugin does not exist`. I honestly didn't think that the site I was working on used the [Inline Entity Form](https://www.drupal.org/project/inline_entity_form) module, so I hadn't installed it. Installing it did not resolve the issue, so I dove into the issue queue for that project and found a workaround at <https://www.drupal.org/project/inline_entity_form/issues/3208995>. That did the trick for me, but it looks like <https://www.drupal.org/project/inline_entity_form/issues/3221074> might also be a good solution.

## Google Analytics

The migrations related to the [Google Analytics](https://www.drupal.org/project/google_analytics) module failed, so I searched its issue queue, too. The solution was to uninstall and remove the module, then install the [dev](https://www.drupal.org/project/google_analytics/releases/8.x-3.x-dev) version and apply the patch at <https://www.drupal.org/project/google_analytics/issues/3170816>.

## YouTube

The D7 version of the site has a content type with a field type of "Youtube," which was supplied by the [YouTube Field module](https://www.drupal.org/project/youtube). I wasn't planning to use the YouTube Field module on the D9 version of the site, since D9 has a native Media field type that includes an option for embedding remote video files. But, since the module is supported for D8 and D9, I installed and enabled it. After that, the migration occurred without issue.

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/es/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/drupal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
