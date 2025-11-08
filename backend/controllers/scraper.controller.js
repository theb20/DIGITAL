// Simple web scraping controller using native fetch and cheerio
// Accepts: { url: string, selectors?: { item: string, title?: string, link?: string, excerpt?: string, image?: string, date?: string } }
// Returns: { success: true, count, items: Array<{ title, link, excerpt, image, date }> }

import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

function normalizeText(t) {
  if (!t) return '';
  return String(t).replace(/\s+/g, ' ').trim();
}

function absoluteUrl(baseUrl, maybeRelative) {
  try {
    if (!maybeRelative) return '';
    return new URL(maybeRelative, baseUrl).toString();
  } catch (_) {
    return maybeRelative || '';
  }
}

async function fetchHtml(url) {
  const headers = {
    // A realistic UA helps reduce basic bot-blockers
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  };
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} while fetching ${url}`);
  }
  return await res.text();
}

async function resolveImageFromPage(linkUrl) {
  try {
    const html = await fetchHtml(linkUrl);
    const $ = cheerio.load(html);
    // Prefer Open Graph/Twitter images
    const og = $('meta[property="og:image"], meta[name="og:image"]').attr('content') || '';
    const tw = $('meta[name="twitter:image"], meta[property="twitter:image"]').attr('content') || '';
    let image = og || tw || '';
    if (!image) {
      // WordPress/Gutenberg featured image or first img on page
      image = $('.wp-block-post-featured-image img').attr('src')
        || $('.post-thumbnail img').attr('src')
        || $('img').first().attr('src')
        || '';
    }
    return absoluteUrl(linkUrl, image);
  } catch (_) {
    return '';
  }
}

function extractItems($, baseUrl, selectors) {
  const sel = {
    item: 'article',
    title: 'h1, h2, .entry-title, .post-title',
    link: 'a',
    excerpt: 'p, .excerpt, .entry-content p',
    image: 'img',
    date: 'time, .date, .post-date',
    ...(selectors || {}),
  };

  const items = [];
  $(sel.item).each((_, el) => {
    const $el = $(el);
    const titleEl = sel.title ? $el.find(sel.title).first() : $el;
    const linkEl = sel.link ? $el.find(sel.link).first() : $el.find('a').first();
    const excerptEl = sel.excerpt ? $el.find(sel.excerpt).first() : $el.find('p').first();
    const imgEl = sel.image ? $el.find(sel.image).first() : $el.find('img').first();
    const dateEl = sel.date ? $el.find(sel.date).first() : $el.find('time, .date').first();

    const title = normalizeText(titleEl.text() || $el.text());
    // Support RSS where <link> is text content, not an href
    let rawLink = linkEl.attr('href') || linkEl.text();
    if (!rawLink) {
      rawLink = $el.find('link').first().text() || $el.find('guid').first().text() || '';
    }
    const link = absoluteUrl(baseUrl, rawLink);
    let excerpt = normalizeText(excerptEl.text());
    if (!excerpt) {
      excerpt = normalizeText($el.find('description').first().text() || $el.find('content\\:encoded').first().text());
    }
    // Try common attributes for image; support RSS (enclosure/media:content)
    const imageAttrCandidates = ['data-src', 'src', 'url', 'href'];
    let image = '';
    for (const attr of imageAttrCandidates) {
      const v = imgEl.attr(attr);
      if (v) { image = v; break; }
    }
    if (!image) {
      image = $el.find('enclosure').attr('url') || $el.find('media\\:content').attr('url') || '';
    }
    // Fallback: parse HTML inside RSS (content:encoded or description) to get first <img>
    if (!image) {
      const htmlBlock = $el.find('content\\:encoded').first().text() || $el.find('description').first().text() || '';
      if (htmlBlock) {
        try {
          const $inner = cheerio.load(htmlBlock);
          const imgHtml = $inner('img').first();
          const v = imgHtml.attr('data-src') || imgHtml.attr('src') || imgHtml.attr('url') || '';
          if (v) image = v;
        } catch (_) { /* ignore parse errors */ }
      }
    }
    // Normalize image to absolute URL
    image = absoluteUrl(baseUrl, image);
    const date = normalizeText(dateEl.attr('datetime') || dateEl.text());

    if (title) {
      items.push({ title, link, excerpt, image, date });
    }
  });
  return items;
}

export async function scrape(req, res) {
  try {
    const body = req.body || {};
    const query = req.query || {};
    const url = body.url || query.url;
    const selectors = body.selectors || undefined;

    if (!url) {
      return res.status(400).json({ success: false, error: 'Missing "url" parameter' });
    }

    const html = await fetchHtml(url);
    const $ = cheerio.load(html);
    const items = extractItems($, url, selectors);

    // Resolve missing images by fetching the linked page and reading og:image
    const resolved = await Promise.all(items.map(async (it) => {
      if (!it.image && it.link) {
        const img = await resolveImageFromPage(it.link);
        if (img) it.image = img;
      }
      return it;
    }));

    return res.json({ success: true, count: resolved.length, items: resolved });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message || 'Scraping failed' });
  }
}