---
title: "Rebuilding a Theme, Part III: Working with Twig"
author: "Samuel J. Huskey"
date: "2024-07-09"
url: "/posts/upgrading-theme-part-3"
description: "Some notes on working with the Twig, Drupal's templating language"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

After creating my subtheme, this is what the front page looked like without any custom styling:

![Screenshot of my bare subtheme](/assets/images/front-end/new-subtheme.png "New Subtheme"){.image}

I tend to work from top to bottom when doing front end work, so I'm going to start with the `<header>`, which contains everything inside the black bar in the image above.

If I open my Web Developer Tools (see [part 1](https://sjhuskey.info/posts/upgrading-theme-part-1)), and scroll to the `<header>` section, this is what I see:

![Screenshot of developer tools for header](/assets/images/front-end/developer-tools.png "Developer Tools"){.image}

The lines in green text are supplied by the Twig debugger that I turned on earlier (again, see [part 1](https://sjhuskey.info/posts/upgrading-theme-part-1)). They tell me which Twig files are responsible for rendering the content. If I'm happy with them, I can leave them as they are. But if I want to change anything, I'll need to **override** the Twig template.

The `<!-- FILE NAME SUGGESTIONS: …>` comment tells developers two things: the name of the template currently responsible for rendering something and other potential names that are available, if the template needs to be overridden. The names go from very specific to generic as they go from left to right.

For example, the following is the list of suggestions for the template that renders the entire page:

```html
<!-- FILE NAME SUGGESTIONS: ▪️ page--front.html.twig ▪️ page--node--9938.html.twig 
 ▪️ page--node--%.html.twig ▪️ page--node.html.twig ✅ page.html.twig -->
```

The check mark in front of `page.html.twig` tells me that it's the currently active template. As I read back up the list, I find increasingly specific names:

- `page--node.html.twig`: This is the name for a template that would handle all nodes
- `page--node--%.html.twig`: The `%` is a kind of placeholder for other information, such as what follows in the next point
- `page--node--9938.html.twig`: "9938" is the node ID of the content that is displayed on my front page. I could use this template name to give that node a special layout.
- `page--front.html.twig`: `front` specifies this template name for any node set as the front page

## Example: Overriding the Template for the Front Page

Let's say that I want to create a template just for the front page, so `page--front.html.twig`. I need to make a new file with that name in my subtheme. For guidance on the location, I'll look at the Twig debug comment right below the file name suggestions:

```html
<!-- 💡 BEGIN CUSTOM TEMPLATE OUTPUT from 'themes/contrib/bootstrap5/templates/layouts/page.html.twig' -->
```

That tells me that the contributed theme Bootstrap5 supplies the current template for the front page. I can add the `templates/layouts` directory structure to my subtheme and save the Bootstrap5 theme's `page.html.twig` there as `page--front.html.twig`. After clearing the cache `drush cr` and reloading the front page in my browser, I now see this:

```html
<!--  FILE NAME SUGGESTIONS: ✅ page--front.html.twig ▪️ page--node--9938.html.twig ▪️ page--node--%.html.twig ▪️ page--node.html.twig ▪️ page.html.twig -->
<!-- 💡 BEGIN CUSTOM TEMPLATE OUTPUT from 'themes/custom/dll_catalog/templates/layouts/page--front.html.twig' -->
```

See? My new `page--front.html.twig` template is now being used. If I make changes to it, those changes will be reflected on the screen. And if the Bootstrap5 theme is upgraded, I won't lose my work.

## Overriding Other Templates

Sometimes, the template that you need to override is not in the parent of your subtheme. In that case, the Twig debug messages will tell you where to look for the theme that is currently being used. A common place to look for templates is in `web/core/modules/system/templates`, where you'll find all kinds of goodies. You can also look for templates in the theme listed in `web/core/themes`, but be advised that many of them have content that depends on scripts provided elsewhere in the theme.

## Takeaways

In general, the process for overriding a template is the same no matter the source:

1. Use Twig file name suggestion messages to identify the name of the theme you need to override and a more specific name for it
1. Use Twig custom template output messages to find the location of the template you need to override
1. Make a new file in your subtheme
1. Alter the content of that file to suit your needs
