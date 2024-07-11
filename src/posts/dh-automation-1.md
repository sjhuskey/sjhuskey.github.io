---
title: "Tales of DH Automation"
author: "Samuel J. Huskey"
date: "2023-09-22"
layout: base
image: "/assets/images/dh-automation.jpg"
url: "/posts/dh-automation-1/"
tags:
  - Python
  - Digital Humanities
  - automation
---

One of my favorite things is using technology to eliminate or at least reduce the amount of tedious, repetitive, and boring tasks that friends and colleagues encounter in their work, so I'm starting a series on this blog to give others some ideas of what technology can do for them.

My eyes were opened to these possibilities when I read _[Automate the Boring Stuff with Python](https://automatetheboringstuff.com/)_ by Al Sweigart. It is an excellent book for anyone curious about Python and, more generally, how to get machines to do the mindless tasks that can make life unpleasant. I highly recommend it.

## Renaming Files … Lots and Lots of Files

My colleage [Bill Endres](https://www.ou.edu/cas/english/about/faculty/b-endres) asked me for help with a task that routinely takes a lot of his time. An expert in multi-spectral imaging, Bill takes dozens and dozens of images in a typical imaging session. The software he uses labels each image with a date-time stamp and the light frequency in use. For example, the file name `20230720_132856_365_nm.tif` tells us that the image was taken on July 20, 2023 (20230720) at 1:28:56 p.m., and that the light frequency in use was 365nm.

The thing is that each object (i.e., page of a manuscript in this case) is imaged in sixteen different frequencies, so the result of imaging one page is a list of images like this:

```bash
20230815_102820_365_nm.tif
20230815_102826_385_nm.tif
20230815_102832_395_nm.tif
20230815_102838_420_nm.tif
20230815_102844_450_nm.tif
20230815_102851_470_nm.tif
20230815_102857_500_nm.tif
20230815_102903_530_nm.tif
20230815_102909_560_nm.tif
20230815_102915_590_nm.tif
20230815_102922_615_nm.tif
20230815_102928_630_nm.tif
20230815_102934_660_nm.tif
20230815_102941_730_nm.tif
20230815_102947_850_nm.tif
20230815_102953_940_nm.tif
```

That's one page. The only indicator that the page has changed is the frequency number: when it goes back to `365_nm`, you know that Bill has started to take images of a new page.

Bill needed a more descriptive file name. Specifically, he wanted the files to be named using the pattern {Manuscript Name} (e.g., 'HerefordGos'), {Page} (e.g., 1), {Face} ("recto" or "verso"), {Frequency}. He also needed the value of {Page} to increase by one after every cycle of sixteen light frequencies. He has much better things to do with his time than manually renaming hundreds of files, so he wondered about a way to rename the files automatically.

My go-to solution being Python, I started working up a script for him. In days past, I would have spent a fair amount of time trying out various ideas, consulting [Stack Overflow](https://stackoverflow.com/), and debugging my script until I got it right. But with the advent of intelligent chatbots, I can cut down significantly on that process. I just need to know how to ask the chatbot the right questions.

(I hear that "[Prompt Engineer](https://en.wikipedia.org/wiki/Prompt_engineering)" is an up-and-coming career. Maybe I should look into that ….)

Here's what I asked:

> I need to rename the files in a directory, and I'd like to use Python to do it. Here are the details: my program produces files with names like `20230720_132856_365_nm.tif`. The first part of the filename (20230723_132856) is a date-time stamp; the second part (365_nm) is a light frequency. I want to write a function that will accept the arguments `directory`, `msName`, `page`, and `face` and do the following:
>
> 1. Parse and extract the timestamp from each filename.
> 2. Group the files by their timestamp and ensure each group has 16 (or fewer) files.
> 3. Sort the groups of files based on the light frequency.
> 4. Strip the underscore from the light frequency (i.e., turn `365_nm` into `365nm`)
> 5. Rename the files according to the pattern `{msName}_{page}{face}_{frequency}.tif`.

I also asked it to make the script callable from the command line and to ignore any files that don't end in `.tif`. Here's what we ended up with after a couple of iterations:

```python
#!/usr/bin/env python3

import os
import argparse

def rename_files(directory, msName, firstPage, face):
    # Verify that the face value is either 'r' or 'v'
    if face not in ['r', 'v']:
        raise ValueError("The face argument must be either 'r' or 'v'.")
    # Define light frequency order
    light_frequencies = [365, 385, 395, 420, 450, 470,
                         500, 530, 560, 590, 615, 630, 660, 730, 850, 940]

    # Extract files and sort by timestamp
    all_files = os.listdir(directory)
    sorted_files = sorted(all_files, key=lambda f: f.split('_')[
                          1] if '_' in f else f.split(' ')[1])

    # Group files in chunks of 16 based on their timestamp sequence
    chunks = [sorted_files[i:i + 16] for i in range(0, len(sorted_files), 16)]

    # Initialize current page
    current_page = firstPage

    for chunk in chunks:
        # Counter for tracking light frequency index
        freq_index = 0
        # Sort each chunk based on light frequency
        sorted_chunk = sorted(chunk, key=lambda f: int(
            f.split('_')[2] if '_' in f else f.split(' ')[1].split('_')[0]))

        for filename in sorted_chunk:
            # Extract light frequency number
            if '_' in filename:
                light_freq = int(filename.split('_')[2])
            else:
                light_freq = int(filename.split(' ')[1].split('_')[0])

            # Construct the new filename
            new_name = f"{msName}_{str(current_page).zfill(4)}{str(face)}_{light_freq}nm.tif"

            # Full paths to old and new filenames
            old_path = os.path.join(directory, filename)
            new_path = os.path.join(directory, new_name)

            # Rename the file
            os.rename(old_path, new_path)
            print(f"Renamed: {filename} -> {new_name}")

            # Check if we have cycled through all frequencies and need to reset
            # if it's the last frequency in the list
            if light_freq == light_frequencies[-1]:
                current_page += 1
                freq_index = 0
            else:
                # Increment frequency index for the next iteration
                freq_index += 1

# Example usage:
# Let's say your directory is "my_directory" and msName is "HerefordGos" and starting page number is 1
# rename_files("my_directory", "HerefordGos", 1, "r")

if __name__ == "__main__":
    # Initialize the argument parser
    parser = argparse.ArgumentParser(
        description='Rename files based on given rules.')
    parser.add_argument('directory', type=str,
                        help='Path to the directory containing files to be renamed.')
    parser.add_argument('msName', type=str, help='Manuscript name.')
    parser.add_argument('firstPage', type=int, help='Starting page number.')
    parser.add_argument('face', type=str, choices=['r', 'v'], help='r (recto) or v (verso).')

    # Parse the command line arguments
    args = parser.parse_args()

    # Call the function
    rename_files(args.directory, args.msName, args.firstPage, args.face)
```

That can rename hundreds of files in a couple of seconds. I haven't tried timing it with Python's `time` functionality, but I imagine you'd have to try running it on tens of thousands of files before you'd notice the amount of time it takes.

Anyway, thanks for reading this first edition of "Tales of DH Automation".

---

Photo by [Joshua Sortino](https://unsplash.com/@sortino?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText) on [Unsplash](https://unsplash.com/photos/LqKhnDzSF-8?utm_source=unsplash&utm_medium=referral&utm_content=creditCopyText).
