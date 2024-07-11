const pluginRss = require("@11ty/eleventy-plugin-rss"); // needed for absoluteUrl feature
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const moment = require("moment");
moment.locale("en");
// Base setup for builds, needed for og tags and correct image paths
// (mostly for github pages deployment, see build-deploy.yaml)
const baseUrl = process.env.BASE_URL || "http://localhost:8080";
const pathPrefix = process.env.PATH_PREFIX || "/";
// e.g. '/11ty-plain-boostrap5/'
console.log("baseUrl is set to ...", baseUrl);
console.log("pathPrefix is set to ...", pathPrefix);

// will be accessible in all templates via
// see "eleventyConfig.addGlobalData("site", globalData);"" below
// related: https://github.com/11ty/eleventy/issues/1641
const globalSiteData = {
  title: "Samuel J. Huskey",
  description: "Samuel J. Huskey's Personal Website",
  locale: "en",
  baseUrl: baseUrl,
  pathPrefix: pathPrefix,
  lang: "en",
  home: "https://sjhuskey.info/",
};
// Add CSS to Markdown text.
// From https://giuliachiola.dev/posts/add-html-classes-to-11ty-markdown-content/
const markdownIt = require("markdown-it");
const markdownItAttrs = require("markdown-it-attrs");

const markdownItOptions = {
  html: true,
  breaks: true,
  linkify: true,
};

const markdownLib = markdownIt(markdownItOptions).use(markdownItAttrs);

// https://www.11ty.dev/docs/plugins/image/#use-this-in-your-templates
const Image = require("@11ty/eleventy-img");

async function imageShortcode(src, alt, sizes = "100vw") {
  if (alt === undefined) {
    // You bet we throw an error on missing alt (alt="" works okay)
    throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
  }

  // TODO: pathPrefix must be '/path/', check existence of trailing slash?!
  let metadata = await Image(src, {
    widths: [600, 1200],
    formats: ["webp", "jpeg"],
    urlPath: `${pathPrefix}img`,
    // outputDir: "./img/" is default
    outputDir: "./docs/img/", // passthrough below didn't work, write to output dir by now
  });

  let lowsrc = metadata.jpeg[0];
  let highsrc = metadata.jpeg[metadata.jpeg.length - 1];

  return `<picture>
    ${Object.values(metadata)
      .map((imageFormat) => {
        return `  <source type="${imageFormat[0].sourceType}" srcset="${imageFormat
          .map((entry) => entry.srcset)
          .join(", ")}" sizes="${sizes}">`;
      })
      .join("\n")}
      <img
        src="${lowsrc.url}"
        width="${highsrc.width}"
        height="${highsrc.height}"
        alt="${alt}"
        loading="lazy"
        decoding="async">
    </picture>`;
}

module.exports = function (eleventyConfig) {
  // Set excerpting
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_separator: "<!-- excerpt -->",
  });

  // Set Markdown library
  eleventyConfig.setLibrary("md", markdownLib);

  // Dates
  eleventyConfig.addFilter("dateIso", (date) => {
    return moment(date).toISOString();
  });

  eleventyConfig.addFilter("dateReadable", (date) => {
    return moment(date).utc().format("LL"); // E.g. May 31, 2019
  });

  // Set site title
  eleventyConfig.addGlobalData("site", globalSiteData);

  // Add plugins
  // Add the RSS feed plugin with metadata
  eleventyConfig.addPlugin(pluginRss, {
    type: "atom", // or "rss", "json"
    outputPath: "feed/feed.xml",
    collection: {
      name: "posts", // iterate over `collections.posts`
      limit: 0, // 0 means no limit
    },
    metadata: {
      language: "en",
      title: "S.J. Huskey's Blog",
      subtitle:
        "I post about technical issues and problems that I run into while building, using, and maintaining various digital resources, mostly to keep a record for myself of how I solved them. If that information helps someone else, all the better!",
      base: "https://sjhuskey.info/",
      author: {
        name: "Samuel J. Huskey",
        email: "huskey@ou.edu", // Optional
      },
    },
  });
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  eleventyConfig.addPlugin(syntaxHighlight);

  // Copy dist/ files from laravel mix
  eleventyConfig.addPassthroughCopy("dist/"); // path is relative from root

  // Copy (static) files to output (_site)
  eleventyConfig.addPassthroughCopy("src/assets");

  // Copy transformed images
  // TODO: this is executed too soon? imgs not there?
  eleventyConfig.addPassthroughCopy("img/");

  // Copy downloadable files.
  eleventyConfig.addPassthroughCopy("src/files");

  // Important for watch: Eleventy will not add a watch for files or folders that
  // are in .gitignore (--> dist/),unless setUseGitIgnore is turned off. See this chapter:
  // https://www.11ty.dev/docs/watch-serve/#add-your-own-watch-targets
  eleventyConfig.setUseGitIgnore(false);

  // Watch for changes (and reload browser)
  eleventyConfig.addWatchTarget("./src/assets"); // normal (static) assets
  eleventyConfig.addWatchTarget("./dist"); // laravel-mix output changes

  // RandomId function for IDs used by labelled-by
  // Thanks https://github.com/mozilla/nunjucks/issues/724#issuecomment-207581540
  // TODO: replace with addNunjucksGlobal? https://github.com/11ty/eleventy/issues/1498
  eleventyConfig.addFilter("generateRandomIdString", function (prefix) {
    return prefix + "-" + Math.floor(Math.random() * 1000000);
  });

  // eleventy-img config
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  // Create a list of tags.
  // From https://stackoverflow.com/a/66186773/2943704
  eleventyConfig.addCollection("tagsList", (collectionApi) => {
    const tagsSet = new Set();
    collectionApi.getAll().forEach((item) => {
      if (!item.data.tags) return;
      item.data.tags.filter((tag) => !["foo", "bar"].includes(tag)).forEach((tag) => tagsSet.add(tag));
    });
    return [...tagsSet].sort((a, b) => b.localeCompare(a));
  });
  // Set posts as a collection
  eleventyConfig.addCollection("posts", function (collectionApi) {
    return collectionApi.getFilteredByGlob("./src/posts/*.md");
  });
  // Base Config
  return {
    dir: {
      input: "src",
      output: "docs",
      includes: "includes", // this path is releative to input-path (src/)
      layouts: "layouts", // this path is releative to input-path (src/)
      data: "data", // this path is releative to input-path (src/)
    },
    templateFormats: ["njk", "md"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
    // important for github pages build (subdirectory):
    pathPrefix: pathPrefix,
  };
};
