---
title: "Wrestling with Solr on Docker"
author: "Samuel J. Huskey"
date: "2024-07-31"
url: "/posts/wrestling-solr"
description: "Notes from a recent struggle with Solr"
layout: base
image: "/assets/images/docker-catoosa.jpg"
tags:
  - Drupal
  - Linux
  - Docker
  - posts
---

Every time I install and configure Apache Solr for a Drupal site, I find myself bogged down in a variety of issues, so I thought it would be helpful (if only to me) to record what I gleaned from the latest instance.

## My History with Solr

My first experience with Solr was on the original Digital Latin Library Catalog site, which was on Drupal 7. I preparation for working with it, I read the extensive [documentation](https://solr.apache.org/guide/solr/latest/index.html). With all its talk of [zookeepers](https://zookeeper.apache.org/), my confusion and trepidation grew quickly. Then I realized that Drupal's [Search API Solr module](https://www.drupal.org/project/search_api_solr) took care of most, but certainly not all, of the difficulties. I still had to install and configure Solr, but I eventually managed to get it up and running. I wish that I had documented all the steps back then, but I was so relieved to have made progress that I moved on to something else.

My second experience with Solr was when I enhanced the search features on the website of the [Society for Classical Studies](https://classicalstudies.org/). Since I am not the system administrator for the SCS, we paid the hosting company (the heroic and wonderful folks at [EsoSoft](https://www.esosoft.com/)) to spin up a Solr server. They opted to install Solr as a [Docker](https://www.docker.com/) container, so I had the opportunity to learn about managing Solr via `docker` commands. I wish that I had documented that experience, too, but I was eager to move on after I had a working setup.

When I started using the super-awesome [DDEV](https://ddev.com/) for local development, I had to work with Solr again as a Docker container. In this instance, I did take the time to [document the process](https://sjhuskey.info/posts/upgrading-theme-part-10/).

Now that I have finished [migrating the content of the DLL's Catalog site from Drupal 7 to Drupal 10](https://sjhuskey.info/posts/drupal-7-to-drupal-10/) and [rebuilding its theme](https://sjhuskey.info/posts/drupal-7-to-drupal-10/), I need to move the site to my production server, and that involves upgrading Solr. Having learned my lesson from previous experiences, I'm going to document the process here.

## Upgrading or Reinstalling Solr?

Since the server is currently configured for a Drupal 7 site, Solr wasn't the only item in need of an upgrade. I had to upgrade PHP, MariaDB, and Java, among other things. Fortunately, the `dnf` package manager made quick work of that.

I tried simply upgrading Solr, but I ran into a mess of conflicts and permissions issues, so I decided to uninstall it, remove it, and start with a clean slate. I had a decision to make: run Solr as an application on the server or as a Docker container? The latter has a lot to recommend it, particularly when it comes to maintenance and upkeep, so I decided to install it that way.

## Solr in Docker

Apache's [documentation on Solr in Docker](https://solr.apache.org/guide/solr/latest/deployment-guide/solr-in-docker.html) is pretty good, as is the [documentation for the Search API Solr module](https://www.drupal.org/docs/extending-drupal/contributed-modules/contributed-module-documentation/search-api-solr). But there are definitely gaps here and there, and I spent more hours than I care to admit trying to figure out how to fill them. It was a "non-trivial" number of hours. That's all I will say.

### Installing Docker and Solr

To run Solr in Docker, you obviously need to have Docker on your server. That's easy. I'm using a Red Hat Linux server, so the `dnf` package manager can take care of it:

1. Make sure that `dnf` can find the Docker repository: `sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo`
1. Install Docker, et al.: `sudo dnf install -y docker-ce docker-ce-cli containerd.io`
1. Start Docker: `sudo systemctl start docker`
1. Enable Docker (i.e., make sure that it will start automatically after rebooting): `sudo systemctl enable docker`

Grabbing the [official Docker Solr image](https://hub.docker.com/_/solr/) is not difficult, either: `sudo docker pull solr:9.6.1`.

Okay, I have all the components. Now what?

This is where the documentation becomes opaque, at least for me. It's clear enough if you just need to start a Solr server and get to work. If you need Drupal to connect to your Solr server, you have to hold your mouth just right. At least it seems that way.

The Search API Solr module makes you put the cart before the horse, as it were. That is, you have to create a server first, then connect Drupal to it. Only then can you download a configuration set and create the Solr core that you need to start indexing content.

So, the first step is to create a Solr server.

### Creating a Solr Server

In the following steps, the Solr server I'm creating is `dllsolr`, and the core is `dllcatsolr`. You should be able to substitute your own values for those.

Since I'm going to run Solr in a Docker container, I need to use a `docker` command to create it: `docker run -d -p 8983:8983 --name dllsolr solr`

I'll break that down:

- `docker run` is the command to create and run a container
- `-d` causes the container to run in the background
- `p 8983:8983` maps the container to port 8983, which is the port often used for Solr
- `--name dllsolr` gives the container the name `dllsolr`.
- `solr` tells Docker to use the Solr image that I downloaded earlier

After running that command, Solr was running as a Docker container. Great! But Drupal wasn't able to connect to it because the Search API Solr module expects to use a username and password. To satisfy that requirement, I need to secure Solr with a `security.json` file.

### Securing Solr

Fortunately, the DLL Catalog doesn't need most of the [robust security measures available](https://solr.apache.org/guide/solr/latest/deployment-guide/securing-solr.html). I just need to add a `security.json` file to set up Basic Authentication. But even that's not a trivial affair.

At a minimum, a `security.json` file should look like this:

```json
{
   "authentication":{
      "class":"solr.BasicAuthPlugin",
      "credentials":{"solr":"IV0EHq1OnNrj6gvRCwvFwTrZ1+z1oBbnQdiVC3otuq0= Ndd7LKvVBAaZIF0QAVi1ekCfAJXr1GGfLtRUXhgrF8c="}
   },
   "authorization":{
      "class":"solr.RuleBasedAuthorizationPlugin",
      "permissions":[{"name":"security-edit",
         "role":"admin"}],
      "user-role":{"solr":"admin"}
   }
}
```

That's directly from the [Apache Solr documentation](https://solr.apache.org/guide/solr/latest/deployment-guide/authentication-and-authorization-plugins.html#configuring-security-json).

The really important part is this:

```json
{
   "credentials":{"solr":"IV0EHq1OnNrj6gvRCwvFwTrZ1+z1oBbnQdiVC3otuq0= Ndd7LKvVBAaZIF0QAVi1ekCfAJXr1GGfLtRUXhgrF8c="}   
}
```

This is the line that establishes the credentials (obviously) needed to log on to the Solr server and perform operations. It's pretty clear that `solr` is meant to be the username, but the password needs some explaining. In this example, the password is actually "SolrRocks". But it wouldn't be safe to put that in plain text, so it must be "hashed" first. And you can't use just any tool to hash the password. I tried using a Python script with the `bcrypt` library to hash a password, but that didn't work. Well, it produced a hashed password, but it didn't work with Solr. I couldn't find any guidance in the Solr documentation about how to create the hash, so I did a search of the internet and found this wonderful tool: [https://clemente-biondo.github.io](https://clemente-biondo.github.io/). (Bless you, Clemente Biondo, whoever you are!) This client-side tool allows you to enter a password of your choice into a form and get a hashed password and a template for using it in a `security.json` file.

Okay, now that I had a hashed password in a `security.json` file, I had to get it into the Docker container. Here, again, you need to know a secret.

It's easy to copy files to and from a Docker container. As long as you know the ID of the container, you just use `docker cp`, as in `docker cp myfile.txt DOCKERID:/path/to/directory`. But if you just do that, the file you copy won't have the correct permissions, and _there will be no way to change them or to remove the file after it is in the container_. The answer is to use the `-a` switch on `docker cp`. That switch preserves (the "a" is for "archive") everything about the file's permissions and ownership and prevents it from being changed by Docker.

So, after hashing the password and adding it to `security.json`, copy it into the Solr Docker container like this: `docker cp -a security.json 82fd162cad53:/var/solr/data`.

I'll break that down:

- `docker cp` tells Docker to copy something into or out of a container
- `-a`: archive mode, to preserve the file's permissions from being modified by Docker
- `security.json` is the name of the file to be copied from the server to the Docker container
- `82fd162cad53:` is the ID of the Docker container. The ID can be discovered by doing `docker ps`.
- `/var/solr/data` is the destination for the file in the Docker container.

Now, do `docker restart dllsolr` to put the security measure into effect.

Great! I have a Solr server running in a Docker container, and it is secured with basic authentication. Now I need to tell Drupal how to reach it.

## Configure Search API Solr in Drupal

**Important, time-saving advice**: Before doing anything else, determine the IP address of the Docker container. This is a crucial piece of information for configuring Drupal to connect to the Solr server:

```twig
{% raw %}docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}" dllsolr{% endraw %}
```

Copy the IP address into a text file and keep it on hand.

Now, to start the process of creating a Solr "server" in Drupal, go to `/admin/config/search/search-api` in the Drupal site. I put "server" in quotation marks because we've already created the server. That's what everything above was about. It's more accurate to say that we're creating a connection to the Solr server.

1. Click "+Add server"
1. Enter a name for the server
1. Check the "Enabled" box (if it isn't already checked)
1. Enter a description
1. Select "Solr" as the Backend
1. In "Configure Solr backend", select "Basic Auth"

Now, in the "Configure Basic Auth Solr connector" submenu, do the following:

1. **HTTP protocol**: http
1. **Solr host**: Enter the IP address of the Docker container that you obtained earlier. You'll see some instructions that say you should enter `localhost` here. That's true if you're running Solr as an application (i.e., not in a Docker container). But if you're running Solr in a Docker container, you need the IP address.
1. **Solr port**: enter "8983"
1. **Solr path**: enter "/"
1. **Solr core**: enter the name of the core that you will create later. I'm using "dllcatsolr".

Leave everything else as it is, except for the HTTP basic authentication fields. Here you should enter the username from your `security.json` file (e.g., "solr") and the actual password (i.e., NOT THE HASH in the `security.json` file). If you entered "MYPASSWORD" in the hashing tool [https://clemente-biondo.github.io/](https://clemente-biondo.github.io/), enter "MYPASSWORD" in the password field here.

Click "Save". If all goes well, you should see a message that the Solr server could be reached. The **Core Connection** field, however, should say "The Solr core could not be accessed" (or something like that). That's because we still need to create a core on the Solr server.

## Create a Solr Core

This is the most involved part of this whole process. The first step is to download a configuration set ("configset"):

1. Go to `/admin/config/search/search-api` in the Drupal UI
1. Click the name of your server
1. On the "View" page that should come up, click the button "+ Get config.zip" to download the configset (probably named something like `solr_9.x_config.zip`)

Now you need to upload the configset to your the server that hosts your site and your Solr Docker container. I use `scp` ("secure copy") to do that: `scp solr_9.x_config.zip myuser@myserver:~/`.

After logging on to your server:

1. Make a new director called "conf": `mkdir conf`.
1. Unzip the configset to the "conf" directory: `unzip solr_9.x_config.zip -d conf`
1. Copy the "conf" directory to Solr's home directory (`/var/solr/data`) in the Docker container: `docker cp -a conf 82fd162cad53:/var/solr/data`
1. Restart the Docker container: `sudo systemctl restart dllsolr` (replace `dllsolr` with the name of your Solr Docker container)

Now it's time to log on to the Solr Docker container and create the core:

1. Log on to the Docker container: `docker exec -it dllsolr /bin/bash` (replace `dllsolr` with the name of your Solr Docker container)
1. Create the core: `/opt/solr/bin/solr create_core -c dllcatsolr -d conf`

I'll break that last line down:

- `/opt/solr/bin/solr`: This is the directory where Solr's commands are stored
- `create_core`: This is one of the commands stored in `/opt/solr/bin/solr`
- `-c dllcatsolr`: This tells Solr to name the core "dllcatsolr"
- `d conf`: This tells Solr to use the configset that you downloaded from your Drupal site and copied to the Solr Docker container

If all goes well, you should now have a Solr core.

## Make Sure Docker and Solr Restart Automatically

In the section on installing Docker above, I recommended doing `sudo systemctl enable docker` to make sure that Docker restarts automatically whenever the server is rebooted. We need to update the Solr Docker container to tell it to restart automatically, too. That can be done with `docker update --restart always dllsolr` (or whatever your Solr server is called). Now, both Docker and the Solr server should start up automatically whenever the system is rebooted.

## Useful Commands

Some useful commands to know for managing Solr as a Docker container:

- `docker ps`: Shows the ID of any running containers and their status, among other things
- `docker exec -it dllsolr /bin/bash`: Get access to the container's shell
- `docker logs dllsolr`: Outputs all the log entries for your Solr server. The output can be reduced to the most recent entries by piping it to `tail`: `docker logs dllsolr | tail`
- `curl http://localhost:8983/solr/admin/info/system`: Check the status of the Solr server
- `curl http://localhost:8983/solr/admin/cores\?action\=STATUS\&core\=\dllcatsolr`: Check the status of a core (the last value in the URL string)

Also, to find the IP address of the Docker container:

```twig
{% raw %}docker inspect -f "{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' dllsolr{% endraw %}
```

***

_Image credit: The Blue Whale of Catoosa. Photo by Carol M. Highsmith - <https://www.loc.gov/pictures/collection/highsm/item/2010630004/>, Public Domain, <https://commons.wikimedia.org/w/index.php?curid=20572688>_
