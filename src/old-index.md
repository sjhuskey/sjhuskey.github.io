---
meta:
  lang: en
  title: Samuel J. Huskey
  description: Samuel J. Huskey's personal website
layout: base
eleventyNavigation:
  key: home
---

# Welcome!

![Sam Huskey](/assets/images/sjhuskey-2017.jpg){.float-image}

This is the personal web site of Samuel J. Huskey.

I launched this site as a space where I could write about my adventures in web development, text and data analysis, digital philology, and technology in general, apart from my main research project, the [Digital Latin Library](https://digitallatin.org/).

I intend to use this site to post about technical issues and problems that I run into while building and maintaining various digital resources, mostly to keep a record for myself of how I solved them. If that information helps someone else, all the better!

I also wanted to experiment with different web applications. I've been a Drupal developer since version 6, and I have also worked with ExpressionEngine and a variety of other content management systems. I built the first version of this site with WordPress, then I tried it on [Jekyll](https://jekyllrb.com/). Now it's on [11ty](https://www.11ty.dev/)!

If you want to know more about me, I invite you to read my [About page](about) and view my [CV](about/cv.html).

<hr />
    <h2>My Blog Posts</h2>
    <ul>
      {%- for item in collections.posts | reverse -%}
      <li>
        <a href="{{ item.url | url }}">{{ item.data.title }}</a> | {{ item.data.date | dateReadable }}
      </li>
      {%- endfor -%}
    </ul>
