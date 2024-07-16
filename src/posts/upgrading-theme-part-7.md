---
title: "Rebuilding A Theme, Part VII: Contextual Views"
author: "Samuel J. Huskey"
date: "2024-07-16"
url: "https://sjhuskey.info/posts/upgrading-theme-part-7"
description: "Notes on rebuilding views after a migration"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

When users come to an author's page on the DLL Catalog site, they should see all of the information about that author, plus links to related content such as works by that author, individual editions of those works, and web pages that contain the author's works.

Here's what that looks like on the old site:

![Screenshot of the old Author Authority page](/assets/images/front-end/content-author-authority-old.png "Old Author Authority page"){.image}

I accomplished the lists of related content with contextual views. A contextual view is a feature of the powerful [Views module](https://www.drupal.org/docs/8/core/modules/views), an interface for generating, obviously, views of content. The "contextual" part refers to the display of content depending on a specific context, like when a particular value (e.g., a node's ID) is in the page's URL.

Since there isn't a migration path for views, I must rebuild all of the site's views from scratch. Fortunately, it's a pretty easy job. I'll just go through the steps for showing works related to an author, since the others pretty much work the same way on my site.

## Adding a View

I'll head over to the Views interface at `admin/structure/views`. From there I'll click "+Add view", which will take me to a form for creating my view:

![Screenshot of the Add view page](/assets/images/front-end/view-add-view.png "Add View page"){.image}

1. **View name**: I like to be as systematic and descriptive as possible with view names, so I'm going to name this view "Contextual view for Author Authority: DLL Work". I'll also check the "Description" box and enter "A contextual view that displays DLL Work nodes related to a specific Author Authority".
1. **View settings**: I want to show "Content" of type "DLL Work". I don't really care how the content is sorted.
1. **Page settings**: I want to create a page, so I'll check this box. I can leave the default values in the other fields, but I want to select "HTML List" of "Titles (linked)" in the pulldown menus.
1. **Block settings**: I don't need to create a block, so I'll leave this unchecked.
1. Click "Save and edit"

Now I'll see the View interface:

![Screenshot of the View interface](/assets/images/front-end/views-interface.png "View Interface"){.image}

## Building a Relationship

Since establishing a relationship between DLL Work nodes and their corresponding Author Authority node is essential for this view (i.e., it's the contextual part), I'll go over to the "Advanced" part of the View interface first and click "Add" next to "Relationships". I want to select "Content referenced from field_author" so that I can have access to all of the fields of the Author Authority node associated with DLL Work through the "Author" field (`field_author`). Basically, this opens a window onto the associated Author Authority record, and I'll be able to grab practially any data from it. I'll click "Add and configure relationships". Now I'll check "Require this relationship" so that I won't get any unrelated content, then I'll click "Apply".

## Providing Context

Now I can create the contextual part of the view. In the "Advanced" part of the View interface, I'll click "Add" next to "Contextual filters". In the window that opens, I'll select "DLL Identifier (field_dll_identifier)", since I want to view DLL Work nodes _in the context of_ their author, each of which has a unique identifier. Now I'll click "Add and configure contextual filters".  In the new window, I'll select "field_author: Content" from the Relationship dropdown, to make sure that the context is dependent upon that relationship. Now, sometimes there aren't any works to display, so I need a way to handle that. That's where the "When the filter value is NOT available" part comes in handy. I'll select "Display contents of 'No results found'". Later, I'll go to the "No results behavior" area of the Views interface and add a text field with the content `<p><em>No records have been entered for this author at this time.</em></p>`. That way, the user will see _something_ if there aren't any records to display. Now I'll click "Apply" to, well, apply those settings.

![Screenshot of the contextual filter window](/assets/images/front-end/view-contextual-filter-window.png "Contextual filter window"){.image}

## Testing

Now I can test the contextual view. The Views interface has a handy "Preview" feature. I'll scroll down to that part and enter the DLL Identifier for Virgil (A4830) in the "Preview with contextual filters" field. This is what I see after clicking "Update preview":

![Screenshot of the Views preview](/assets/images/front-end/view-update-preview.png "Previewing a contextual view"){.image}

It works! The DLL Works related to Virgil—and only those DLL Works—are listed.

## Fine-tuning

For a contextual view to work, it needs a placeholder (e.g., `%`) in its URL. I'll go to the "Page Settings" part of the Views interface and click on "Path:". Now I'll insert `/%` at the end of the URL (e.g., `contextual-view-for-author-authority-dll-work/%`). Now I'll be able to use the DLL identifier in the Twig template for the Author Authority content type to filter this view.

I also want to be sure to list _all_ of the works without relying on a pager. I'll go down to the "Pager" section and click on "Mini", the default value for "Use pager:". Now I'll select "Display all items" and click on "Apply". I'll click "Apply" again in response to the next window about offset values. The "Use pager:" field should now have the values "Display all items | All items".

I'll click "Save" now and move on to creating my other contextual displays. I can easily do that from the same Views interface I've been working on in this post. I just click "+Add" in the Views interface and select "Page" to create a copy of the display that I have just made. I'll change "Content: Content type (= DLL Work)" in the "Filter Criteria" section to "Content: Content type (= Item Record)". Now the relationship and contextual filter I created previously will apply to this display, too, only this time it will display "Item Record" content. I need to change the URL, too.

**Note**: When changing the filter criteria, select "This page (override)" in the "For" dropdown at the top of the window. Otherwise, whatever you do will apply to EVERY display in the View.

**Another note**: Give your pages distinctive names by clicking the "Display name" link and entering something descriptive. That makes managing the site much easier.

I might have to come back to this view when I start to work on theming the content type that will use it, but at least it does what I need it to do for now.

## Takeaway

Views is a powerful, extremely useful feature of Drupal. It's no wonder that it became a part of Drupal's core starting with version 8. Relationships and contexts make Views even more versatile, since they make it easy to connect content on a Drupal site in a dynamic way.
