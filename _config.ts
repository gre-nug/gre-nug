import lume from "lume/mod.ts";

import date from "lume/plugins/date.ts";
import feed from "lume/plugins/feed.ts";
import katex from "lume/plugins/katex.ts";
import metas from "lume/plugins/metas.ts";
import nav from "lume/plugins/nav.ts";
import readingInfo from "lume/plugins/reading_info.ts";
import redirects from "lume/plugins/redirects.ts";
import sitemap from "lume/plugins/sitemap.ts";
import slugifyUrls from "lume/plugins/slugify_urls.ts";

import minifyHTML from "lume/plugins/minify_html.ts";
import lightningCss from "lume/plugins/lightningcss.ts";
import terser from "lume/plugins/terser.ts";

import footnotes from "lume/plugins/markdown/footnotes.ts";
import image from "lume/plugins/markdown/image.ts";
import figure from "lume/plugins/markdown/figure.ts";
import title from "lume/plugins/markdown/title.ts";
import toc from "lume/plugins/markdown/toc.ts";

import shiki from "shiki/mod.ts";
import tailwindcss from "lume/plugins/tailwindcss.ts";

const markdown = {
  plugins: [
    [figure, { decoding: true, figure: true, image_size: true, base_path: Deno.cwd() }],
  ],
};

// setup + markdown preprocessing
const site = lume({
  location: new URL("https://grenug.fr"),
  src: "/",
  includes: "/assets/layout",
  dest: "/outputs",
  cssFile: "/assets/style/lume.css",
  fontsFolder: "/assets/style",
  server: { debugBar: false },
}, {
  markdown,
});
// ignore and add
site
  .ignore("flake.nix")
  .ignore("flake.lock")
  .ignore("license.txt")
  .ignore("readme.md")
  .add("/assets/static/favicon.ico", "/favicon.ico")
  .add("/assets", "/assets");

// metadata
site
  .data("external", false)
  .data("hidden", false)
  .data("layout", "page.vto")
  .data("metas", {
    lang: "en-US",
    title: "=title",
    description: "=description",
    image: "/assets/static/logo.png",
  });

// /pages/* -> /*
site.preprocess([".html"], (pages) => {
  for (const page of pages) {
    if (page.src.path.startsWith("/pages/")) {
      page.data.url = page.data.url.replace("/pages/", "/");
    }
  }
});

// plugins
site
  .use(redirects())
  .use(metas())
  .use(slugifyUrls())
  .use(readingInfo())
  .use(date())
  .use(nav())
  .use(toc())
  .use(title())
  .use(image())
  .use(footnotes());

// styling
site
  .use(katex())
  .use(shiki({ highlighter: { themes: ["nord"] }, theme: "nord" }))
  .use(tailwindcss({ minify: true }));

// sitemap/rss generation
site
  .use(minifyHTML({ extensions: [".css", ".html", ".js"] }))
  .use(lightningCss({ includes: "/assets/layout", options: { minify: true } }))
  .use(terser())
  .use(sitemap())
  .use(feed({
    published: new Date(0),
    output: ["feed.json"],
    limit: 25,
    sort: "created=desc",
    query: "hidden=false title!='GreNUG'",
    info: { title: "GreNUG", description: "Grenoble Nix User Group", generator: false },
    items: { title: "=title", description: "=description", published: "=created" },
  }));

// check for broken links
// import checkUrls from "lume/plugins/check_urls.ts";
// site.use(checkUrls({
//   external: true,
//   output: (broken) => {
//     console.log(`Found ${broken.size} broken links:`);
//     for (const [link, pages] of broken) {
//       console.log(`+ ${link} found in:`);
//       for (const p of pages) {
//         console.log(`  - ./pages${p.slice(0, -1)}.md`);
//       }
//     }
//   },
// }));

export default site;
