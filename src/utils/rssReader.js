import Parser from "rss-parser";
const parser = new Parser();

async function fetchNewsFromRSS() {
  const feed = await parser.parseURL(
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
  );
  const articles = feed.items.slice(0, 50).map((item) => ({
    title: item.title,
    content: item.contentSnippet,
    link: item.link,
  }));

//   console.log("Fetched articles:", articles.length);
  return articles;
}

export { fetchNewsFromRSS };

