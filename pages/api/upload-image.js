import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ message: 'Image upload failed' });

    const file = files.file;
    const data = fs.readFileSync(file.filepath);

    try {
      const uploadRes = await fetch(`${process.env.WORDPRESS_URL}/wp-json/wp/v2/media`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.WP_USER}:${process.env.WP_APP_PASSWORD}`).toString('base64')}`,
          'Content-Disposition': `attachment; filename="${file.originalFilename}"`,
          'Content-Type': file.mimetype,
        },
        body: data,
      });

      const uploadData = await uploadRes.json();
      res.status(200).json({ id: uploadData.id, url: uploadData.source_url });
    } catch (error) {
      res.status(500).json({ message: 'Upload to WordPress failed' });
    }
  });
}
