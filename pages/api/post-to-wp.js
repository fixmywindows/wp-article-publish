export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { WP_URL, WP_USER, WP_PASS } = process.env;
  if (!WP_URL || !WP_USER || !WP_PASS) {
    return res.status(500).json({ message: 'Missing WP credentials' });
  }

  const {
    title,
    content,
    summary,
    categories,
    tags,
    featured_image_id
  } = req.body;

  const auth = Buffer.from(`${WP_USER}:${WP_PASS}`).toString('base64');

  try {
    const response = await fetch(`${WP_URL}/wp-json/wp/v2/posts`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        content,
        excerpt: summary,
        status: "publish",
        categories,
        tags,
        featured_media: featured_image_id
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ message: result.message || 'Failed to post' });
    }

    return res.status(200).json({
      message: 'Post published',
      post: {
        id: result.id,
        title: result.title.rendered,
        link: result.link
      }
    });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
}
