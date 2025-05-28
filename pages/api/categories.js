// /pages/api/categories.js

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const wpRes = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/categories?per_page=100`, {
      headers: {
        Authorization: `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`
      }
    });

    const categories = await wpRes.json();
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
}
