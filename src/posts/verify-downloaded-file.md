---
title: "Verify a Downloaded File"
author: "Samuel J. Huskey"
date: 2021-06-22
tags:
  - Linux
  - "System Administration"
  - posts
image: "/assets/images/linux.jpg"
layout: base
---

Sometimes it's necessary to download a file to install, update, or upgrade something on your computer. Whenever you download anything from the internet, you should take steps to verify that it is what you expected—and nothing more.

Many software providers give you a way to verify that the file you're downloading has not been altered. They do this by "signing" the file with a unique code. If the file has been altered in some way (e.g., with the addition of a virus or other malware), then its signature will change.

You can verify the signature by comparing it to the signature posted by the provider. Some will include a separate file to download that contains the verification code. Others will simply post the code on the same page as the file you're downloading.

But those signatures are really long, so comparing the file's signature to the one you copied from the site is an error-prone, time-consuming task. It's a perfect opportunity for automation!

There are many ways to do this, but the easiest (for me, anyway) is to use the `shasum` tool that is typically bundled with Linux distributions.

Let's say that you want to [download Solr](https://solr.apache.org/downloads.html). You'll find there something like this:

> `solr-8.11.1.tgz [PGP] [SHA512]`

That is, a link to the archive of the latest distribution of Solr and some links to the PHP and SHA512 hashes.

If you download the archive and the SHA512 file (which you might have to right click to get) to the same directory, you can then do the following:

```bash
shasum -c solr-8.11.1.tgz.sha512
```

You might have to wait a second or two, but then, if everything is as it should be, you'll get the message:

```bash
solr-8.11.1.tgz: OK
```

If you don't get that message, _don't open the archive file_. Something is wrong.

<hr />
<span style="font-size:smaller">Photo by <a href="https://unsplash.com/@mudmanuk?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Paul Carroll</a> on <a href="https://unsplash.com/s/photos/penguin?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText">Unsplash.</a> Penguins, get it?</span>
