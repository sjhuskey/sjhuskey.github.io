---
title: "Updating Composer"
author: "Samuel J. Huskey"
date: 2021-06-25
tags:
  - Linux
  - System Administration
  - Composer
  - posts
image: "/assets/images/composer.jpg"
layout: base
---

I decided to upgrade my [Composer](https://getcomposer.org/) because I was tired of seeing the following notice every time I used it:

`Warning from https://repo.packagist.org: Support for Composer 1 is deprecated and some packages will not be available. You should upgrade to Composer 2. See https://blog.packagist.com/deprecating-composer-1-support/`

Since I was upgrading Composer for use with a Drupal site, I used the directions at <https://www.drupal.org/docs/develop/using-composer/preparing-your-site-for-composer-2> to guide me along the way. Here is what I encountered.

The instructions warned me that I would receive errors if my current composer version was too old. However, the suggestions there did not resolve this error:

`[Composer\Downloader\FilesystemException] Filesystem exception: Composer update failed: "/usr/local/bin/composer" could not be written. rename(/home/sjhuskey/.cache/composer/composer-temp.phar,/usr/local/bin/composer): Permission denied`

I remembered encountering this before, however. Following the suggestion of [Boss COTIGA](https://stackoverflow.com/a/48359743/2943704) resolved the issue. Here's what I did:

```bash
sudo rm /usr/local/bin/composer
cd ~/.cache/composer
chmod 755 composer-temp.phar
sudo mv composer-temp.phar /usr/local/bin/composer
```

I also ran into this error:

`[UnexpectedValueException] Your github oauth token for github.com contains invalid characters:`

I've seen that before, too. My github oauth token is fine, but Composer has a bug that makes it think otherwise. Fortunately, [rafaelbitten](https://stackoverflow.com/a/67005141/2943704) has a solution. His first step, however, is a doozy: "Find the `composer/auth.json` file." For me, that's in `~/.config/composer`, not in `~/.composer`, as it might be for some. After I found my `auth.json` file, I copied the oauth part (actually, it was the only thing in the file), pasted it somewhere for the moment, and replaced it with `{}` so that Composer wouldn't throw another error: `Expected one of: 'STRING', 'NUMBER', 'NULL', 'TRUE', 'FALSE', '{', '['`. Of course, after I did that, I ran into the `Filesystem exception` error from above when I did `composer selfupdate`, so I repeated the Boss COTIGA's process.

After that, `composer selfupdate` showed that I was using the most current stable version.

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/@marius?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Marius Masalar</a> on <a href="https://unsplash.com/s/photos/music?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
