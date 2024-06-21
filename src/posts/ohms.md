---
title: "Using the OHMS Viewer with DDEV"
author: "Samuel J. Huskey"
url: "https://sjhuskey.info/posts/ohms/"
description: "How to set up a basic PHP environment for testing the OHMS Viewer."
date: "2024-06-21"
layout: base
image: "/assets/images/tech.jpg"
tags:
  - OHMS
  - posts
---

A colleague asked me to help her get started using the [Oral History Metadata Synthesizer's](https://www.oralhistoryonline.org/) [OHMS Viewer](https://github.com/uklibraries/ohms-viewer). It is meant to integrate with a CMS, but she just needs to see how it works for now. Instead of going through the trouble of setting up access to a remote server, I decided to see if I could get it working with [DDEV](https://ddev.com/), a super-easy-to-use application for developing web sites locally (i.e., on a laptop or desktop computer).

## Prerequisites

- Comfort using a Command Line Interface (e.g., Terminal).
- [Docker](https://www.docker.com/). The instructions for different operating systems are available at [https://ddev.readthedocs.io/en/stable/users/install/docker-installation/](https://ddev.readthedocs.io/en/stable/users/install/docker-installation/).
- [DDEV](https://ddev.com/): Instructions are at [https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/](https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/).
- OHMS Viewer: Download the latest release at [https://github.com/uklibraries/ohms-viewer/releases](https://github.com/uklibraries/ohms-viewer/releases). It is available as a `zip` or `tar.gz` archive. I'm working with the `tar.gz` file.
- An account on [Aviary](https://www.aviaryplatform.com/).

## Set up a PHP environment with DDEV

1. Make a new directory called "ohms": `mkdir ohms`. I put mine in `~/Sites`.
1. Change into the new directory and run the following command: `ddev config`. This will launch a dialog. You can just press the `return` key for the first two prompts (`Project name:` and `Docroot Location`), but be sure to enter `php` for the third prompt (`Project Type`).
1. Execute the command `ddev start`.

At this point, there should be a bare site that you can visit by opening a web browser and going to `http://ohms.ddev.site`. You'll probably see the message **403 Forbidden**. That's okay.

## Copy the OHMS Viewer files into the PHP Environment

1. Extract the OHMS Viewer archive to your PHP environment: `tar -xvf ohms-viewer-3.9.3.tar.gz -C ~/Sites/ohms`.
1. Rename the new directory "ohms-viewer": `mv ohms-viewer-3.9.3 ohms-viewer`.

## Make a cachefiles Directory

1. Change into `ohms-viewer`.
1. Create a new directory called "cachefiles" (`mkdir cachefiles`).

This is where you'll eventually put your OHMS XML files.

## Edit the OHMS Viewer's Config File

1. Change into the `config` directory within `ohms-viewer`: `cd ~/Sites/ohms/ohms-viewer/config`.
1. Make a copy of `config.template.ini` and call it `config.ini`.
1. Using a text editor, edit the content of `config.ini`. Change the first line to read `tmpDir = cachefiles`. The rest of the file can be left as it is.
1. Save `config.ini`.

## Test the Viewer

For this step, you'll need an OHMS XML file from an OHMS collection on [Aviary](https://www.aviaryplatform.com/). To obtain an XML file, you'll need to create an OHMS record in the OHMS Studio. When the record is complete, you should be able to click on the three vertical dots on the far right of the row and select "Export XML".

Put the XML file into the `cachefiles` directory created above.

You should now be able to use a web browser to navigate to `http://ohms.ddev.site/ohms-viewer/viewer.php?cachefile=YOUR-XML-FILE.xml` to see the record in the OHMS Viewer. Be sure to replace `YOUR-XML-FILE` with the actual name of your file.
