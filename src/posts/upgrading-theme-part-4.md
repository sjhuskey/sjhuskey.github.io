---
title: "Rebuilding a Theme, Part IV: Working with Bootstrap"
author: "Samuel J. Huskey"
date: "2024-07-11"
url: "https://sjhuskey.info/posts/upgrading-theme-part-4"
description: "Notes on working with Bootstrap"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

Bootstrap has a lot of default settings, so it's good to familiarize yourself with how the subtheme handles the defaults and, more importantly, how to override them.

The [Bootstrap5](https://www.drupal.org/project/bootstrap5) theme handles default settings and overrides in an intelligent way. In the [subtheme that I made earlier](https://sjhuskey.info/posts/upgrading-theme-part-2), there's a directory called `scss`. It contains four files:

1. \_variables_bootstrap.scss
1. \_variables_drupal.scss
1. ck5style.scss
1. style.scss

The extension `.scss` stands for "Sassy Cascading Style Sheets, by the way. I don't know how "sassy" they are, but it's a cool system for dealing with CSS.

## \_variables_bootstrap.scss

The `_variables_bootstrap.scss` file is where I'll override any of the Bootstrap settings that I might want to customize. The subtheme already has the following overrides:

```scss
// Bootstrap variables (overrides).
$form-text-margin-top: 0;
$legend-font-size: 1rem;
$table-cell-padding-x: 0.75rem;
```

Obviously, I need to know the names of the variables before I can override them. Fortunately, I can look to the parent theme for that. The file at `web/themes/contrib/bootstrap5/dist/bootstrap/5.3.3/scss/_variables.scss` lists most of the available variables. If I want to override one across the site, I can copy its name into the `_variables_bootstrap.scss` file and enter the updated value(s) for it.

Let's say you have a specific shade of blue that is important for your organization's brand. You could use the `_variables_bootstrap.scss` file to set the variable `$blue` to your shade of blue. That way, you can just use the word "blue" in your CSS. Bear in mind, however, that you'll affect the other shades of blue that are built into Bootstrap. You could also use these variables to set a specific color for links, font-size, and many, many other aspects of the look of your site.

## \_variables_drupal.scss

The Bootstrap5 theme also has a bunch of default settings above and beyond what Bootstrap makes available. The `_variables_drupal.scss` file in the subtheme already has this:

```css
// Theme variables.

$navbar-brand-image-height: 36px !default;
$navbar-brand-image-height-lg: 60px !default;
$navbar-brand-image-width: auto !default;
$navbar-brand-image-margin: 0 1rem 0 0 !default;

$navbar-brand-site-title-text-transform: uppercase !default;
$navbar-brand-site-title-font-size: 1.5rem !default;
$navbar-brand-site-title-font-weight: bold !default;
$navbar-brand-site-title-letter-spacing: 2px !default;
$navbar-brand-site-slogan-font-size: 0.875rem !default;

$region-padding: 0 0.5rem !default;

$footer-padding: 2rem 0 !default;

$nav-tabs-link-active-bg-sm: #dee2e6 !default;

$local-tasks-primary-margin: 1rem 0 !default;
$local-tasks-secondary-margin: 0 0 1rem 0 !default;

$table-striped-bg: #f9f9f9 !default;
```

The full list of available "theme" variables can be found at `web/themes/contrib/bootstrap5/scss/drupal`. That directory contains several files with transparent names like `_footer.scss` and `_navbar.scss` that make it easy to identify the file that matters to you. Well done, Bootstrap5 developers!

## ck5style.scss

Don't touch this file unless you really, really need to style specific things about the WYSIWYG editor CKEditor.

## style.scss

This is where I'll do most of my styling work. For example, the `navbar` in my brand-new subtheme is black. The Digital Latin Library's brand features a specific shade of blue (`#005cb9`), and I'd like to change the background color of the `navbar` to that.

I'll follow Carol Kelly's suggestion at <https://stackoverflow.com/a/43382283> for accomplishing this objective.

I'll need to override the Twig template for the navbar to change its CSS class, and I'll need to add some CSS code to `style.scss` to define the new class.

When I use my browser's Developer Tools to inspect the `navbar`, I find that the Twig debugger tells me that it is handled by the `page.html.twig` template. When I pull up that file in the Bootstrap5 parent theme's `templates/layouts` directory, I can see a block that is setting a variable `nav_classes`. That sets the navbar's classes to specific values for every page. After copying `page.html.twig` to my subtheme's `templates/layouts` directory, I'll add `navbar-custom` to that first line, and then I'll define `navbar-custom` in `style.scss`. So, I'll change `set nav_classes = 'navbar navbar-expand-lg' ~` to `set nav_classes = 'navbar navbar-expand-lg navbar-custom' ~`. I also need to change the logic of this line:

```twig
(b5_navbar_bg_schema != 'none' ? " bg-#{b5_navbar_bg_schema}" : ' ')
```

to this:

```twig
(b5_navbar_bg_schema != 'dark' and b5_navbar_bg_schema != 'none' ? " bg-#{b5_navbar_bg_schema}" : '')
```

The original version translates to "If the b5_navbar background scheme is not set to 'none', then set the background to the value of the navbar background schema; otherwise, set it to nothing." The new version translates to "If the background schema is not 'dark' and it isn't set to 'none', then set the background to the background schema; otherwise, set it to nothing." That way, I can remove the `bg-dark` class that is currently controlling the look of my header.

Now, I need to define the style for `navbar-custom`. I'll open `style.scss` and add this below the existing content:

```css
/* ===================================================== 
    Navbar
   ===================================================== */

/* Cribbed from https://stackoverflow.com/a/43382283 */
/* change the background color */
.navbar-custom {
  background-color: #005cb9;
}

/* change the link color */
.navbar-custom .navbar-nav .nav-link {
  color: #fff;
}

/* change the color of active or hovered links */
.navbar-custom .nav-item.active .nav-link,
.navbar-custom .nav-item:focus .nav-link,
.navbar-custom .nav-item:hover .nav-link {
  color: #a33701;
}
```

Notice that I added a comment with some fancy formatting to make it stand out and to give some structure to my SCSS document. This will make it easier to maintain. I also added a comment to give credit where credit is due.

I've changed the background color of the navbar to the DLL's shade of blue. I also specified that the links in the navbar should be white (#fff), and when they are active they should be a reddish-brown color (#A33701).

Since I made a change to `style.scss`, I need to recompile the CSS. The theme's README file instructs me to execute the command `sass scss/style.scss css/style.css && sass scss/ck5style.scss css/ck5style.css` in the root directory of the subtheme. I did that, then I did `drush cr` to clear the caches. The result is that my navbar's background color is now the right shade of blue!

![Screenshot of my new navbar color](/assets/images/front-end/new-navbar-color.png "New Navbar Color"){.image}

I'll take care of navbar's content in the next post.

## Takeaways

1. Bootstrap has a lot of pre-defined styles that can be overridden to customize the look of your site
1. It's important to familiarize yourself with the variables that can be customized or overridden
1. Theming in Bootstrap typically involves making changes to Twig templates——to add, remove, or change a CSS class or ID—and SCSS files—to define or override CSS classes
1. Even though it took several lines of code in both Twig and SCSS to change the color of the background for a single region in the site, that change will be applied to the entire site, and I won't have to repeat that code anywhere else
