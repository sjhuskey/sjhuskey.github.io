---
title: "Git for Digital Humanities"
author: "Samuel J. Huskey"
date: "2025-07-30"
url: "/posts/git-dh"
description: "Tips for getting the most out of Git"
layout: base
image: "/assets/images/git.jpg"
tags:
  - Git
  - posts
---

Version control is not only for keeping track of research data and files; it is also a potential safeguard against loss of information and a vital component in making research reproducible and, if done well, understandable.

Here are some tips I have developed for myself over the years:

1. Every DH research project should employ the distributed version control system [Git](https://git-scm.com/) for code and, in a separate repository, data.
    - Concerns about the size of the dataset and its content (e.g., whether it contains protected, private, sensitive, or proprietary information) must dictate how the dataset is tracked.
    - Use [Git LFS](https://git-lfs.com/) for tracking large files (audio, video, large datasets, etc.). 
1. A `.gitignore` file should be used judiciously to prevent sensitive, protected, or proprietary knowledge from being tracked by Git and pushed to remote repositories. A useful collection of ready-made `.gitignore` files can be found at <https://github.com/github/gitignore>.
1. Exercise great caution when tracking private or sensitive information with Git. If protected data is included in even one commit, it will be discoverable if the repository is publicly shared—even if the file is removed from later commits. Never fear, though. You can use [git-filter-repo](https://github.com/newren/git-filter-repo) to, well, filter that mistake out of all commits and tags in your repo. You can also do [this](https://stackoverflow.com/questions/8740187/git-how-to-remove-file-from-historical-commit/8741530#8741530), but it's riskier.
1. Every Git repository should have a `README.md` file that provides basic information about the project.
1. Every Git repository should have a license clearly indicating whether the content can be shared, reused, repurposed, etc. The site <https://choosealicense.com/> is a good resource for determining which license is appropriate.
1. Code repositories should include files (e.g., `requirements.txt`, `environment.yml`) that enable other researchers to use the same software versions that were used in the original project.
1. Commit messages should be thought of as a research journal, containing consistent and clear language. The [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard is worth following.e Not to toot my own horn, but [I wrote an article on this subject](https://link.springer.com/article/10.1007/s42803-023-00076-9). Don't follow this example: <https://xkcd.com/1296/> 😉.
1. Milestones in the project should have annotated tags that follow an obvious system (e.g., [Semantic Versioning](https://semver.org/)), and those tags should be pushed to the remote repository.
1. Major milestones should be [made citable](https://docs.github.com/en/repositories/archiving-a-github-repository/referencing-and-citing-content) with a service such as [Zenodo](https://zenodo.org/).
1. Each project should have a remote repository on a platform such as [GitHub](https://github.com/), [GitLab](https://gitlab.com/), or ideally an institutional repository.
1. Remote repositories should be set to private if they contain any information that should not be publicly available.

***

<span style="font-size:smaller">Photo by <a href="https://unsplash.com/@6heinz3r?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Gabriel Heinzer</a> on <a href="https://unsplash.com/photos/a-close-up-of-a-computer-screen-with-a-bunch-of-words-on-it-EUzk9BIEq6M?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a></span>