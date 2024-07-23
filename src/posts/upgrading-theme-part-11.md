---
title: "Rebuilding A Theme, Part XI: Template for the Search Page"
author: "Samuel J. Huskey"
date: "2024-07-22"
url: "https://sjhuskey.info/posts/upgrading-theme-part-11"
description: "Notes on theming a site's Solr integration after migrating from Drupal 7 to Drupal 10"
layout: base
image: "/assets/images/drupal.jpg"
tags:
  - Drupal
  - Front End Development
  - posts
---

After installing and configuring Solr and creating a search view and facets ([see part 10 of this series](https://sjhuskey.info/posts/upgrading-theme-part-10/)), I can begin building the search page and the view of results.

To do that, I need to do create a `page--search.html.twig` template, use Twig Tweak to place the relevant blocks in the template, and style the components with CSS.

## Extending the Existing Page Template

When I created the search view, I specified the path as `/search`. When I navigate to that page in my browser and inspect it with the web developer tools, I can see that Twig's file name suggestions list two options for the layout: `page--search.html.twig` and `page.html.twig`. The latter is currently active, so I'm going to make a new template with the name of the former in my subtheme's `templates/layouts` directory.

Since the search page will look different from other pages on the site, this is not just a matter of copying the content of `page.html.twig` and making some minor adjustments. Remember that `page.html.twig` covers practically everything you see on a given page: the header, the navbar, the content, and the footer. I don't want to repeat all that in my `page--search.html.twig` template, since that would mean that if I make any changes to the navbar, for example, I'd have to be sure that I made the changes in both `page.html.twig` and `page--search.html.twig`—and that's just wasting time! Fortunately, I can just make a couple of minor adjustments to my `page.html.twig` template to turn it into something I can _extend_ with other templates. 

Specifically, I'll enclose the `<main>` section with `{% raw %}{% block main %} … {% endblock %}{% endraw %}`, and I'll enclose `{% raw %}{{ page.content }}{% endraw %}` with `{% raw %}{% block content %} … {% endblock %}{% endraw %}`. This is a nice feature of Twig that gives me the option to override a portion of a template. In other words, it is effectively a condition: "If another template extends this one, and if it has content, insert the content here; otherwise, just render the content of the current page."

Here's the new code for the relevant area of `page.html.twig`:

```twig
{% raw %}{% block main %}
 <main role="main">
  <a id="main-content" tabindex="-1"></a>
  {# link is in html.html.twig #}

  {%
  set sidebar_first_classes = (page.sidebar_first and page.sidebar_second) ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-lg-3'
  %}

  {%
  set sidebar_second_classes = (page.sidebar_first and page.sidebar_second) ? 'col-12 col-sm-6 col-lg-3' : 'col-12 col-lg-3'
  %}

  {%
  set content_classes = (page.sidebar_first and page.sidebar_second) ? 'col-12 col-lg-6' : ((page.sidebar_first or page.sidebar_second) ? 'col-12 col-lg-9' : 'col-12' )
   %}


  <div class="{{ b5_top_container }}">
   {% if page.breadcrumb %}
    {{ page.breadcrumb }}
   {% endif %}
   <div class="row g-0">
    {% if page.sidebar_first %}
     <div class="order-2 order-lg-1 {{ sidebar_first_classes }}">
      {{ page.sidebar_first }}
     </div>
    {% endif %}
    <div class="order-1 order-lg-2 {{ content_classes }}">
          {% block content %}
            {{ page.content }}
          {% endblock %}
    </div>
    {% if page.sidebar_second %}
     <div class="order-3 {{ sidebar_second_classes }}">
      {{ page.sidebar_second }}
     </div>
    {% endif %}
   </div>
  </div>
 </main>
{% endblock %}{% endraw %}
```

Now I can focus on the `content` part in the `page--search.html.twig` template. If I make any adjustments to other parts of the `page.html.twig` template (e.g., the navbar), those will affect `page--search.html.twig`, too.

At the top of my `page--search.html.twig` template, I'll insert the following code:

```twig
{% raw %}{% extends 'page.html.twig' %}
    {% block content %}

    {% endblock %}
{% endraw %}
```

The first line shows that this template _extends_ the default page template. The next lines signal that everything between after `block content` and `endblock` should be inserted into the corresponding `content` block in `page.html.twig`.

Now I can work on setting up my search page without worrying about inserting code for the navbar or any other part of the regular page structure.

## Placing the Search Form

In the [previous post](https://sjhuskey.info/posts/upgrading-theme-part-10/), I described the process of creating a block for the exposed search form that is part of the search view. That is what I see when I look at my unstyled search page:

![Unstyled search page](/assets/images/front-end/search-page-unstyled.png "Unstyled search page"){.image}

It's doing the job, but I don't like the fact that it's displaying the "No results" text ("Your search returned no results") when I haven't even searched for anything. Also, if I search for something, I want the form to remain at the top of the list of results so that I can do a new search.

The [Twig Tweak module](https://www.drupal.org/project/twig_tweak) has a handy `drupal_block()` function that I can use to place the search block that I created earlier. First, though, I need to know the machine name for that block. The [Twig Tweak Cheat Sheet](https://git.drupalcode.org/project/twig_tweak/-/blob/3.x/docs/cheat-sheet.md) tells me how to do that using `drush`: `drush ev "print_r(array_keys(\Drupal::service('plugin.manager.block')->getDefinitions()));"`. That gives me a list of all the blocks with their ID numbers. The one I'm looking for is `views_exposed_filter_block:main_solr_search-search'`.

With that information, I'll add this to my `page--search.html.twig` template:

```twig
{% raw %}{% if page.content %}
    <div class="page__content">
        {# Place the search form block #}
        {{ drupal_block('views_exposed_filter_block:main_solr_search-search') }}
    </div>
{% endif %}
{% endraw %}
```

After clearing the caches (`drush cr`) and reloading the page in my browser, I now see this:

![Screenshot of the search form generated by Twig Tweak function](/assets/images/front-end/search-block-with-twig.png "Twig Tweak function for search block"){.image}

But if I search for something, no results will be displayed, because the template doesn't yet have a place for results.

## Search Results

I don't want my "No results" text to be displayed when I haven't searched for anything, so I need a way to control the initial view of the search page. I have a trick for that:

```twig
{% raw %}{# Don't display search results if there aren't any #}
    {% if drupal_view_result('main_solr_search', 'search') is empty %}
     <div></div>
    {% else %}…{% endif %}{{% endraw %}}
```

The `if` statement makes use of Twig Tweak's `drupal_view_result()` function and displays an empty `div` if there aren't any results—and there won't be on the initial view of the search page!

When there are results, I want to display them, obviously, so here's what happens after the `else` statement:

```twig
{% raw %}<div class="container search-container">
    {# Render the search results #}
    <h3>Search Results</h3>
        {{ drupal_view('main_solr_search', 'search') }}
    </div>
{% endif %}{% endraw %}
```

I use the Twig Tweak function `drupal_view()` function to display the results.

## Facets

Solr is all about facets, but I haven't done anything about them yet. Fortunately, they're just Drupal blocks, so I can use the `drupal_block()` function again. First, I have to identify the facets I want to use, so I'll execute the `drush` command that I used earlier: ``drush ev "print_r(array_keys(\Drupal::service('plugin.manager.block')->getDefinitions()));"`. The resulting list tells me that I want`facet_block:content_type` and `facet_block:time_period` (at least for now).

I'd like to use a columnar layout for the search page, so that the facets are in a thin column on the left side of the screen, and the results are in a wider column to the right of that. Here's the code to accomplish that:

```twig
{% raw %}{% extends 'page.html.twig' %}
    {% block content %}
  {% if page.content %}
   <div class="page__content">
    {# Place the search form block #}
    {{ drupal_block('views_exposed_filter_block:main_solr_search-search') }}

    {# Don't display search results if there aren't any #}
    {% if drupal_view_result('main_solr_search', 'search') is empty %}
        <div></div>
    
    {% else %}
     <div class="container search-container">
      <div class="row">
       <div class="col-sm-3">
       {# Render the facets #}
        <div class="search-sidebar">
            <h3>Filter(s)</h3>
            <h4>Content type</h4>
            {{ drupal_block('facet_block:content_type') }}
            <h4>Time period</h4>
            {{ drupal_block('facet_block:time_period') }}
        </div>
       </div>
       
       {# Render the search results #}
       <div class="col-sm-9">
       <h3>Search Results</h3>
            {{ drupal_view('main_solr_search', 'search') }}
       </div>
      </div>
     {% endif %}
    </div>
   </div>
  {% endif %}
{% endblock %}{% endraw %}
```

Here is what that looks like when I search for "Vergil":

![Screenshot of search for Vergil, unthemed](/assets/images/front-end/search-vergil-unthemed.png "Search for Vergil, unthemed"){.image}

It doesn't look great because I haven't done anything about styling it. That's in the next post.

## Takeaways

- The ability to _extend_ a template is a great way to keep your theme's code easy to manage.
- Twig Tweak functions make it really easy to place blocks, views, and other elements.
- Using `if` statements can give you a lot of control over what is displayed on the screen.
