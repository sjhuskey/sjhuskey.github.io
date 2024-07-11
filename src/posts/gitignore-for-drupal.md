---
title: "Gitignore for Drupal"
author: "Samuel J. Huskey"
date: "2023-02-22"
image: "/assets/images/drupal.jpg"
url: "/posts/gitignore-for-drupal/"
tags:
  - Drupal
  - posts
layout: base
---

Here's a .gitignore file that has worked well for my Drupal 8 and 9 sites:

```bash
#ignoreSettings
web/sites/default/settings.php
web/sites/default/settings.local.php
web/sites/default/~settings.local.php

# ignore files directories
web/sites/default/files
private
web/sites/default/files
private
files

#ignore ddev
.ddev
web/sites/default/settings.ddev.php

# Packages #
############
*.7z
*.dmg
*.gz
*.bz2
*.iso
*.jar
*.rar
*.tar
*.zip
*.tgz

# Logs and databases #
######################
*.log
*.sql

# OS generated files #
######################
.DS_Store*
ehthumbs.db
Icon

Thumbs.db
._*

# Vim generated files #
######################
*.un~

# SASS #
##########
.sass-cache
```

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/es/@rubaitulazad?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Rubaitul Azad</a> on <a href="https://unsplash.com/s/photos/drupal?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash</a></span>
