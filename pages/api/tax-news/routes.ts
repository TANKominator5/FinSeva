import Parser from "rss-parser";
import { NextResponse } from "next/server";

export const revalidate = 86400; // 24 hours

const parser = new Parser();

export async function GET() {
  const feed = await parser.parseURL(
    "https://timesofindia.indiatimes.com/rssfeeds/-2128936835.cms"
  );

  const today = new Date().toDateString();

  const todayNews = feed.items.filter(item => {
    if (!item.pubDate) return false;
    return new Date(item.pubDate).toDateString() === today;
  });

  return NextResponse.json(
    todayNews.slice(0, 8).map(item => ({
      title: item.title,
      link: item.link,
      publishedAt: item.pubDate
    }))
  );
}
