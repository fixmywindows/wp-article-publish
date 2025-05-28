// pages/index.js

import { useState, useEffect } from 'react';

export default function Home({ secret }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [featuredImageId, setFeaturedImageId] = useState(null);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/tags').then(res => res.json()).then(setTags);
  }, []);

  const handleGenerate = async () => {
    try {
      const res = await fetch(`/api/generate?secret=${secret}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: input,
      });
      const data = await res.json();
      if (res.ok) {
        setOutput(data);
        setError('');
        setPublishedLink('');
        setSelectedCategories(data.categories || []);
        setSelectedTags(data.tags || []);
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Something went wrong.");
    }
  };

  const toggleItem = (item, list, setList) => {
    setList(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append('file', imageFile);

    const res = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (res.ok) {
      setFeaturedImageId(data.id);
    } else {
      alert(`❌ Image upload failed: ${data.message}`);
    }
  };

  const postToWordPress = async () => {
    if (!output) return;

    setPosting(true);
    setPublishedLink('');
    if (imageFile && !featuredImageId) await uploadImage();

    try {
      const res = await fetch('/api/post-to-wp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: output.title,
          content: output.html,
          summary: output.summary,
          categories: selectedCategories,
          tags: selectedTags,
          featured_image_id: featuredImageId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setPublishedLink(data.post.link);
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert("❌ Failed to post to WordPress");
    } finally {
      setPosting(false);
    }
  };

  return (
    <main style={{ padding: 20 }}>
      <h1>Always A Gift – Article Generator</h1>

      <textarea
        rows="12"
        cols="80"
        placeholder="Paste article JSON here"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        style={{ width: '100%', padding: 10 }}
      />

      <button onClick={handleGenerate} style={{ marginTop: 10 }}>
        Generate
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {output && (
        <div style={{ marginTop: 20 }}>
          <h2>HTML Output</h2>
          <textarea rows="20" style={{ width: '100%' }} value={output.html} readOnly />

          <h2>Metadata JSON</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(output, null, 2)}</pre>

          <h3>Choose Categories</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => toggleItem(cat.id, selectedCategories, setSelectedCategories)}
                style={{
                  backgroundColor: selectedCategories.includes(cat.id) ? '#2563eb' : '#eee',
                  color: selectedCategories.includes(cat.id) ? 'white' : 'black',
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: 5
                }}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <h3>Choose Tags</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => toggleItem(tag.id, selectedTags, setSelectedTags)}
                style={{
                  backgroundColor: selectedTags.includes(tag.id) ? '#10b981' : '#eee',
                  color: selectedTags.includes(tag.id) ? 'white' : 'black',
                  padding: '5px 10px',
                  border: '1px solid #ccc',
                  borderRadius: 5
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>

          <h3>Featured Image</h3>
          <input type="file" onChange={(e) => setImageFile(e.target.files[0])} />
          {featuredImageId && <p>✅ Image uploaded and ready to publish</p>}

          <button
            onClick={postToWordPress}
            disabled={posting}
            style={{
              backgroundColor: posting ? '#ccc' : '#2563eb',
              color: 'white',
              padding: '10px 16px',
              border: 'none',
              borderRadius: '5px',
              marginTop: '10px',
              cursor: 'pointer'
            }}
          >
            {posting ? 'Posting...' : 'Post to WordPress'}
          </button>

          {publishedLink && (
            <p style={{ marginTop: 10 }}>
              ✅ Article published!{' '}
              <a href={publishedLink} target="_blank" rel="noopener noreferrer">
                View it here
              </a>
            </p>
          )}
        </div>
      )}
    </main>
  );
}

export async function getServerSideProps(context) {
  const secret = context.query.secret || '';
  if (secret !== process.env.APP_SECRET) {
    return { notFound: true };
  }
  return { props: { secret } };
}
