---
title: "Converting a Drupal site to 11ty"
author: "Samuel J. Huskey"
date: "2023-06-11"
layout: base
image: "/assets/images/drupal.jpg"
url: "https://sjhuskey.info/posts/drupal-to-11ty/"
tags:
  - Drupal
  - posts
---

The main website for the Digital Latin Library has been running on the Drupal 7 CMS since its launch. As many Digital Humanities scholars know, maintaining the technology stack for an informational site can be an impediment to making real progress on the actual project. As much as I love Drupal, it is definitely more than I need for a few static pages and some blog posts. One must keep up with not only the Drupal codebase, but a MySQL database and the Linux server that it runs on. Moreover, upgrading the site from Drupal 7 to Drupal 10 would simply not be worth the effort. Having performed that task for the [Society for Classical Studies' website](https://classicalstudies.org/), I know how to do it, but I'm not interested in going through that again for a small site like [https://digitallatin.org/](https://digitallatin.org/).

Paying for hosting is also an obstacle. For many years, my home institution's Office of the Vice President for Research and Partnerships gave me the use of a virtual machine for the DLL project, provided that I manage the upkeep and maintenance. That is why I now have the skills to administer Linux servers—valuable skills, to be sure, but again, one more thing to keep up with in this world of DIY Digital Humanities. Since the VPRP wanted to get out of the business of hosting virtual machines, I moved everything over to the university's cloud computing resource. That was a good solution, but again, I had to agree to be the system administrator for the server. I don't mind maintaining a Linux server. There's something satisfying about completing those tasks. Still, it does take time away from other aspects of my research and creative activity.

So, I decided to convert the Digital Latin Library site to the static site manager [11ty](https://www.11ty.dev/). First of all, since it's a _static_ site manager, I don't have to maintain a MySQL database. Second, my content isn't stored in pieces in a database. I can just store it in Markdown files. I like writing in Markdown. Indeed, I do almost _all_ of my writing in [Markdown](https://www.markdownguide.org/) these days. Combined with [Pandoc](https://pandoc.org/), it's remarkably flexible! Third, Git is big part of the workflow for an 11ty site, so count this Git fan in! Finally, I can host my 11ty site on Github for free!

Those are the reasons for converting my site to 11ty. Here are the steps that I took to do it, in case someone else is interested in taking this adventure.

## First step: Export Content from Drupal

I used the Views module in Drupal to export all of my nodes to a CSV file. You'll need to have the [Views module](https://www.drupal.org/project/views) installed and enabled, along with the [Views Data Export module](https://www.drupal.org/project/views_data_export).

My site had a number of different content types, but I was able to use one View for all of them. Your data export view should include at least these fields:

- Content: Title (Title)
- Content: Body (Body)
- Content: Author (Author)
- Content: Path (Path)
- Content: Post date (Post date)
- Content: Category (Category)
- Content: Type (Type)

Your content types might have other fields (e.g., images) that you'll want to include.

I set my data export view to download the content as a CSV file so that I could easily work with it in Python in the next step.

## Use Python to Convert CSV Data to Markdown Files

To be perfectly honest, I consulted [Chat-GPT](https://openai.com/blog/chatgpt) about how to convert my CSV data to individual Markdown files, so the following script is mostly its work.

The CSV file I downloaded from Drupal was called `export_all_content.csv`. Where that occurs in the following script, you'll need to change it to your file's name.

The columns in my CSV file were called Title, Body, Author, Path, Post date, Category, and Type. Your titles might be different, depending on how you set up your data export view in Drupal.

I created a new folder on my computer for this project and called it `dllnew`. Inside that folder, I created two other folders, `markdown` (for the new markdown files) and `data` (for the CSV file). The Python script is in the root of `dllnew`.

```python
import os
import csv
import markdown

# Create the "markdown" directory if it doesn't exist
if not os.path.exists('markdown'):
    os.makedirs('markdown')

''' Default metadata for all pages. Note that I'm using
    'post' as the default for the layout field, since most
    of my pages are blog posts'''

DEFAULT_METADATA = {
    'layout': 'post',
    'title': '',
    'author': '',
    'path': '',
    'date': '',
    'category': ''
}

# Open the CSV file
with open('data/export_all_content.csv', 'r') as csv_file:
    csv_reader = csv.DictReader(csv_file)

    # Loop through each row in the CSV file
    for row in csv_reader:
        # Extract data from the row
        title = row['Title']
        body = row['Body']
        author = row['Author']
        path = row['Path']
        date = row['Post date']
        category = row['Category']
        layout = row['Type']

        # Merge the default metadata with the metadata from the CSV file
        metadata = {**DEFAULT_METADATA, 'title': title, 'author': author, 'path': path, 'date': date, 'category': category, 'layout': layout}

        # Convert the body text to HTML using markdown
        html = markdown.markdown(body)

        # Add the metadata to the beginning of the HTML content
        markdown_text = '---\n' + '\n'.join([f'{k}: {v}' for k, v in metadata.items()]) + '\n---\n\n' + html

        # Replace spaces with hyphens in the filename
        filename = title.replace(' ', '-').lower() + '.md'

        # Write the markdown file
        with open(os.path.join('markdown', filename), 'w') as markdown_file:
            markdown_file.write(markdown_text)
```

Running this script yields one new Markdown file per row in the CSV file, all saved in the `markdown` directory.

## Cleaning Up the Markdown

I noticed that my new Markdown files weren't completely in the Markdown language. That is, the metadata block looked good, but the HTML code from the original Drupal nodes was still present. For example:

```html
---
layout: base
title: Textual Criticism
author:
permalink: /library-digital-latin-texts/textual-criticism
date: 2015-05-08
category:
---

<p>
  Reading an apparatus criticus is hard enough for a human to do; for a computer, it's impossible—at least if the
  apparatus hasn't been encoded. 
</p>
<p>
  Critical editions in print <em>are</em> heavily encoded, but in a way that only humans with special training and lots
  of experience can decode. Because publishers prefer not to sacrifice much real estate on a page to printing
  information that they think only some readers will use, textual scholars have developed a way of compressing the
  information into the allotted space using abbreviations and symbols. Call it a “print-optimized visualization of
  textual data.”
</p>
<p>
  The image above is an excerpt from the Harvard Servius. Consider all of the types of information that appear in the
  entries on a single page:
</p>
<p>
  <img
    alt=""
    src="https://digitallatin.org/sites/default/files/servius_marked_up.png"
    style="border-style:solid; border-width:1px; height:406px; width:600px"
  />
</p>
```

So, I consulted Chat-GPT again to find a good way to convert the HTML code into standard Markdown. After a few tries, I ended up with this:

```python
import os
import html2text

def convert_html_in_markdown(markdown_file):
    # Load the Markdown file
    with open(markdown_file, 'r', encoding='utf-8') as file:
        markdown_content = file.read()

    # Split the Markdown content into metadata and body
    metadata, body = markdown_content.split('---', 2)[1:]

    # Convert HTML to Markdown with custom BodyWidth
    converted_body = html2text.html2text(body, bodywidth=0)

    # Combine the metadata and converted body
    md_content = '---\n' + metadata + '\n---\n' + converted_body

    # Generate the output file name
    md_output_file = os.path.splitext(markdown_file)[0] + '_converted.md'

    # Write the converted Markdown content to the output file
    with open(md_output_file, 'w', encoding='utf-8') as file:
        file.write(md_content)

    print(f"Converted HTML in {markdown_file} to Markdown in {md_output_file}")

def batch_convert_html_in_markdown(markdown_folder):
    # Get the list of Markdown files in the folder
    markdown_files = [f for f in os.listdir(markdown_folder) if f.endswith('.md')]

    # Convert HTML in each Markdown file
    for markdown_file in markdown_files:
        markdown_path = os.path.join(markdown_folder, markdown_file)
        convert_html_in_markdown(markdown_path)

# Specify the folder containing the Markdown files
markdown_folder = '../pages'

# Call the batch conversion function
batch_convert_html_in_markdown(markdown_folder)

```

To use that script on your own files, you'll need to change the value for `markdown_folder` to the path of your Markdown files.

The script will save a new version of your Markdown files with `_converted` appended to the file name, so you won't lose your original versions.

## Next Steps

My next steps will be:

1. Download the files directory from my Drupal 7 site
2. Identify a good place for the image files in my 11ty site
3. Update the image paths in my new Markdown files
4. Work on the theme for the site.

That fourth step is going to take the most time. That's always the way for DIY Digital Humanities projects, am I right? I'm not a graphic designer by any stretch of the imagination. Fortunately, there are many good template to use as a starting point. I think I'll use [11ty-plain-bootstrap5](https://mandrasch.github.io/11ty-plain-bootstrap5/), but [11straps](https://11straps-demo.netlify.app/) also looks like a good option.
