// /pages/api/categories.js and /pages/api/tags.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const endpoint = req.url.includes('tags') ? 'tags' : 'categories';

  try {
    const wpRes = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/${endpoint}?per_page=100`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`
      }
    });

    const data = await wpRes.json();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch ${endpoint}` });
  }
} 
