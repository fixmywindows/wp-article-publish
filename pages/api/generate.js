export default async function handler(req, res) {
  if (req.query.secret !== process.env.APP_SECRET) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const data = req.body;

    const numProducts = data.products.length;
    const adjustedTitle = data.title.replace("X", numProducts.toString());

    const htmlParts = [
      `<h1>${adjustedTitle}</h1>`,
      `<p>${data.intro}</p>`
    ];

    for (const product of data.products) {
      htmlParts.push(
        `<h2><a href='${product.link}' target='_blank'>${product.title}</a></h2>`,
        `<img src='${product.image}' alt='${product.title}' style='max-width:100%; height:auto;'/>`,
        `<p><strong>Price:</strong> ${product.price}</p>`,
        `<p>${product.description}</p>`,
        `<p><strong>Why it’s a great gift:</strong></p><ul>` +
        product.reasons.map(r => `<li>${r}</li>`).join('') + `</ul>`
      );

      let buttonText = "View Product";
      if (product.link.includes("amazon")) buttonText = "Buy on Amazon";
      else if (product.link.includes("etsy")) buttonText = "Buy on Etsy";
      else if (product.link.includes("ebay")) buttonText = "Buy on eBay";

      htmlParts.push(`<p><a href='${product.link}' target='_blank' style='display:inline-block;padding:10px 20px;background-color:#333;color:#fff;text-decoration:none;border-radius:4px;'>${buttonText}</a></p>`);
    }

    htmlParts.push(`<p>${data.closing}</p>`);

    const result = {
      meta_title: data.meta_title,
      meta_description: data.meta_description,
      summary: data.summary,
      title: adjustedTitle,
      featured_image: data.featured_image,
      categories: data.categories,
      tags: data.tags,
      html: htmlParts.join('\n')
    };

    res.status(200).json(result);
  } catch (e) {
    res.status(400).json({ message: 'Invalid input format' });
  }
}