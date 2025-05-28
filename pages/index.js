import { useState } from 'react';

export default function Home({ secret }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);
  const [publishedLink, setPublishedLink] = useState('');

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
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Something went wrong.");
    }
  };

  const postToWordPress = async () => {
    if (!output) return;

    setPosting(true);
    setPublishedLink('');

    try {
      const res = await fetch('/api/post-to-wp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: output.title,
          content: output.html,
          summary: output.summary,
          categories: output.categories || [],
          tags: output.tags || [],
          featured_image_id: output.featured_image_id || null
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
    return {
      notFound: true
    };
  }
  return { props: { secret } };
}
