---
title: "Rebuilding A Theme, Part X: Solr"
author: "Samuel J. Huskey"
date: "2024-07-19"
url: "https://sjhuskey.info/posts/upgrading-theme-part-10"
description: "Notes on theming a site's Solr integration after migrating from Drupal 7 to Drupal 10"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

The old Drupal 7 version of the DLL Catalog uses [Apache Solr](https://solr.apache.org/) to provide [faceted search](https://en.wikipedia.org/wiki/Faceted_search). Since the search page and its results are important features on the DLL Catalog site, I need to install and configure Solr before I can continue rebuilding my theme.

Fortunately, that's relatively easy to do in DDEV, which I'm using to develop my theme locally. [The ddev-solr repo](https://github.com/ddev/ddev-solr) has instructions for installation and configuration, but I'm going to document what I did, since I ran into some obstacles along the way.

## Install DDEV Solr

Installation of ddev-solr boils down to these steps:

1. `ddev get ddev/ddev-solr`
1. `ddev restart`

## Install Drupal Modules

Again, fortunately, the ddev-solr repo also has [instructions for preparing a Drupal site for using Solr](https://github.com/ddev/ddev-solr?tab=readme-ov-file#drupal-and-search-api-solr):

1. Install the [Search API Solr module](https://www.drupal.org/project/search_api_solr): `composer require 'drupal/search_api_solr:^4.3'`. That will cause a bunch of other things to be installed.
1. Enable the Search API Solr module: `drush en -y search_api_solr`. Again, this will cause some other modules to be installed, too. Be sure to enable the `search_api_solr_admin` module, too. It comes with the Search API Solr module, but it isn't installed automatically: `drush en -y search_api_solr_admin`. If you want autocomplete functionality, enable the Search API Solr Autocomplete module: `drush en -y search_api_solr_autocomplete`.
1. Install the [Search API Autocomplete module](https://www.drupal.org/project/search_api_autocomplete), if you want search forms to have autocomplete functionality: `composer require drupal/search_api_autocomplete`, then `drush en -y search_api_autocomplete`.
1. Install the [Facets module](https://www.drupal.org/project/facets/): `composer require 'drupal/facets:^2.0'`, then `drush en -y facets`.

Since my theme is a subtheme of the [Bootstrap5 theme](https://www.drupal.org/project/bootstrap5), I'm also going to install the [Views Bootstrap module](https://www.drupal.org/project/views_bootstrap). It will give me some nice options for rendering the search results.

## Configure Solr

The documentation is a little hazy here, at least for me. The [documentation for Solr](https://solr.apache.org/resources.html#documentation) uses the terms "core" and "collection," but the Search API Solr interface at `/admin/config/search/search-api` only gives you the option to add a new "server" or "index". I finally realized that a "server" in Search API Solr is really a "core" or a "collection", depending on which mode your installation of Solr is using (traditional = core; cloud = collection).

In any case, the first step is to create a server in Drupal's UI.

### Create a server

1. Go to `admin/config/search/search-api`
1. Click "+Add Server". This will open a new page.
1. Enter a name into the "Server name" field and note the corresponding machine name to the right of the field. In my case, I named the server "DLL Catalog"; the machine name is `dll_catalog`.
1. Leave the "Enabled" box checked
1. Enter a description in the "Description" field
1. Under "Backend", choose "Solr"
1. In "Configure Solr backend", select "Solr Cloud with Basic Auth"
1. In "Solr node", insert "solr". **Don't miss this step!** If you leave it at "localhost", you'll run into a lot of trouble. I speak from experience!
1. In "Solr port", insert "8983"
1. "Solr path" should be just "/"
1. "Default Solr collection": Insert the name you want to use for your collection.
1. Leave everything else alone, but scroll down and enter "solr" in the "Username" field and "SolrRocks" in the "Password" field.
1. Click "Save".

You'll probably see some warning messages at this point. That's okay. They'll be handled by the next step. Also, the "Server Connection" field should say "The Solr server could be reached." The "Collection Connection" should say that the collection could not be accessed. That's because you haven't uploaded a configset yet. That's the next step.

### Upload a configset

There are two ways to do this.

The easiest way is in the UI. If you enabled the `search_api_solr_admin` module, you should see a button "+Upload Configset". Click that. After a bit, you should see status messages that say "Successfully uploaded configset" and "Successfully created collection", with the name of your collection. Additionally, the "Collection Connection" should now say that the collection could be accessed.

You can also use `drush` on the command line. Navigate to your site's root directory (i.e., where your site is saved on your computer. Mine is in`~/Sites/d10dllcat`) and execute this command:`ddev drush --numShards=1 search-api-solr:upload-configset SEARCH_API_SERVER_ID`, replacing`SEARCH_API_SERVER_ID` with the machine name of your server (see above). In my case, the command looks like this:

`ddev drush --numShards=1 search-api-solr:upload-configset dllcatalog`

## Create the Index

Solr needs something to search. That's the role of an index. I'm going to create an index for site-wide searching of my four main content types here.

1. Go to `/admin/config/search/search-api` in the UI.
1. Click "+Add index"
1. On the page that comes up, give the index a name in the "Index name" field. I'm using "DLL Catalog Search".
1. In the "Datasources" area, select "Content" to search the content of the site. There are several other options that you might wish to explore.
1. A warning message appeared at this point: "Configure the used datasources". In my case, a "Bundles" area appeared. I'm going to answer the question "Which bundles should be indexed?" with "Only those selected", since I don't want to include blog posts and basic pages.
1. In the "Bundles" checklist, I'm going to select "Author Authority", "DLL Work", "Item Record", and "Web Page".
1. I'll leave the "Languages" section alone, since I don't have multilingual content.
1. Under "Server", I'll select the server I created above: DLLCatalog.
1. I'll check "Enabled"
1. I'll enter a description in the "Description" box.
1. I don't need to do anything in "Index options" or "Solr specific index options".
1. Click "Save and add fields"

Selecting fields takes time and care. You have to make a lot of decisions about what is important to include in the search and how it should be indexed. Since my experience tells me that each site has different needs, I can't offer any general wisdom other than this: consider including the "Rendered HTML output" (`rendered_item`) along with other specific fields that you want to use as facets. "Content type" is another good one. If you want to use text fields as facets, make sure the "Type" is set to "String", since "Fulltext" will not work for facets. Unless you're a super genius, you'll probably have to tinker with this and revise the selection as you test the search functionality.

When you're finished with selecting fields, click "Save changes", then move on to the "Processors" tab. Again, the processors selected here will vary for each site.

You won't be able to do anything with the "Autocomplete" tab until you have set up a search view (see below).

Go back to the "View" tab and select "Queue all items for reindexing", then click "Index now" in the "Start indexing now" area.

## Create a Display Mode for the Content

The search view that I'll create below will display either "Rendered Entity" or "Fields." I'd like to use "Rendered Entity" because I don't want to configure a bunch of individual fields. But I also don't want the view to display the full node for each result. The solution is to create a [display mode](https://www.drupal.org/docs/drupal-apis/entity-api/display-modes-view-modes-and-form-modes).

1. Go to `/admin/structure/display-modes` in the UI
1. Click "View modes"
1. Click "+Add view mode"
1. Choose view mode entity type "Content"
1. Give the view mode a descriptive name (e.g., "Solr Search") and a description
1. Check the content types that the view mode should apply to
1. Click "Save"

Now it's time to indicate what will be displayed when different content types are rendered in the new view mode.

First, go to `/admin/structure/types`.

Now, for each content type that was specified when the view mode was created:

1. Click the arrow in the "Operations" column
1. Select "Manage display"
1. When the display window appears, select the new view mode's name
1. Drag and drop the field names into or out of the "Disabled" area according to your needs. Whatever is not in the "Disabled" area will appear on the screen when the content is rendered in the view mode, in the order in which it is listed in "Field".

## Create a Search View

Go to `/admin/structure/views` in the UI and click "+Add view"

### Add View

1. Give the view a name (e.g., "Main Solr Search") and a description
1. In "View Settings", in the "Show" dropdown menu, select the name of the index you created above (e.g., "Index DLL Catalog Search")
1. In "Page Settings", check "Create a page" and give the page a title and a path. I'm setting my title to "Search" and the path to `search`.
1. I'm going to select "Bootstrap List Group" of "Rendered entity" in the "Page display settings" area. I can change it later, if needed.
1. Click "Save and edit"

### Views Interface

You'll need to do a lot of work here, so save early and save often. I'm going to break it down according to the columns of the Views interface.

#### First column

**Title**: You can change the title if you want. It isn't necessary unless you're going to have multiple displays in your view.

**Format**: I like to use the Bootstrap List Group here because it fits well with my overall use of the Bootstrap framework.

**Show**: I have used "Rendered Entity" or "Fields" here for different projects. In this one, I'm using "Rendered Entity" because I don't want to configure a bunch of individual fields. Instead, I'm going to use the view mode I created above. I'll click "Settings" and select the name of my new view mode for each of the content types listed.

**Filter criteria**: This is where you create the search box. This one requires a lot of configuration. To get started, click "Add" and select "Fulltext search". In the window that appears when you click "Apply and configure filter criteria" do the following:

1. Check "Expose this filter to visitors, to allow them to change it"
1. Check "Required"
1. Choose "Single filter" in "Filter type to expose"
1. Make a label and a description, if you wish
1. In "Operator", choose "Contains any of theses words" to ensure a greedy search
1. "Parse mode" should be set to "Multiple words"
1. If you want to give your users a hint, insert some text in "Placeholder" (e.g., "Enter your search term(s) …")
1. Set the "Minimum keyword length" to "1" to ensure that _something_ has to be in the field to search

#### Second column

**Page settings**: Enter the path that you want for your search page. I chose `search`. Leave **Menu** and **Administration** theme alone.

**Access**: The default "Unrestricted" is fine, unless you want to restrict your search to certain users or roles.

**Header**: Click "Add" and select "Result summary". In the configuration window, enter "Displaying @start - @end of @total results. Use the filters to limit the results." Those placeholders will change as needed.

**Footer**: I leave this blank.

**No results behavior**: Click "Add" and select "Text area". In the configuration window, enter "Your search returned no results." You'll need to do some work with a Twig template later to keep that from showing up even before a user has performed a search.

**Pager**: Select "Full" and "Paged, 10 items".

#### Third column (Advanced)

Expland the column by clicking on the arrow next to "Advanced". There's no need to do anything in either the "Relationships" or the "Contextual filters" area.

**Exposed form**: Change "No" to "Yes" in "Exposed form in block". In "Exposed form style", select "Basic". In "Settings", I like to use "Go" as my "Submit button text". I don't check either of the boxes in this window, and I leave "Exposed sorts label" as it is.

**Other**:

- Machine Name: "search"
- Administrative comment: "None"
- Use Ajax: "No"
- Hide attachments in summary: "No"
- Contextual links: "Shown"
- Query settings: Check "Skip item access checks" and "Bypass access checks"
- Caching: "Search API (none)"
- CSS class: "search-index". I add this class so that I can do some styling later on.

Click "Save"

## Create Facets

Now that you have a search view, you can go to `/admin/config/search/facets` in the UI and add some facets.

1. Click "+Add facet"
1. Select your search view's name in "Facet source"
1. Select a field that you want to use as a facet
1. Enter a name for the facet
1. Click "Save"

Now you need to configure the facet.

1. In the "Widget" area, I like to use "List of checkboxes" for most things, but the others can be good options depending on the use case.
1. In "List of links settings", I select all the boxes.
1. "Facet settings" includes a lot of options that will depend on the site's needs. The names make their functions more or less obvious.
1. Facet sorting: I tend to leave the default values, unless there's a special circumstance.
1. Click "Save"

## Set Autocomplete

1. Go back to `/admin/config/search/search-api` and click on your index
1. Click the "Autocomplete" tab
1. Your search view's name should appear in a list. Check it.
1. Click "Save"

You should see a notice telling you to set the permissions for the search. Click on its link or go to `/admin/people/permissions` and filter on "search". Under "Search API Autocomplete", check "anonymous user" and "authenticated user" for the permission "Use autocomplete for the YOUR_SEARCH_NAME search." Click "Save permissions".

## Enable and Place the Search Block

If you go to `your-url.com/search` now, you will probably see a mostly blank page. That is because the search block that you created when you made the search view has not been enabled and placed in a page.

1. Go to `/admin/structure/block` in the UI
1. Scroll down to "Main content" and click "Place block"
1. Filter by your search view's name. Mine was "Exposed form: main_solr_search-search"
1. Click "Place block"
1. I generally uncheck "Display title" and choose "Override title" so that I can specify the text I want to appear on the search page. I've settled on "Search".
1. In the "Visibility" area, click the "Pages" tab, enter "/" and the path of your search view on one line, then "/" and the path of your search view plus "/\*" on a second line:

![Search block configuration](/assets/images/front-end/search-block-config.png "Search block configuration"){.image}

Click "Save block".

## Summary

After all that, you should have a functioning search page, but you're not going to like how it looks. Here's mine:

![Unstyled search page](/assets/images/front-end/search-page-unstyled.png "Unstyled search page"){.image}

That's because it hasn't been styled! In the next post(s)—it will probably take more than one—I'll write about making a display mode for search results, overriding the template for the search page, placing the facets, and styling the various elements.
