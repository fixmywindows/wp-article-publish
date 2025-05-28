import { useState } from 'react';

export default function Home({ secret }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState(null);
  const [error, setError] = useState('');

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
      } else {
        setError(data.message);
      }
    } catch (e) {
      setError("Something went wrong.");
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
      <button onClick={handleGenerate} style={{ marginTop: 10 }}>Generate</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {output && (
        <div style={{ marginTop: 20 }}>
          <h2>HTML Output</h2>
          <textarea rows="20" style={{ width: '100%' }} value={output.html} readOnly />
          <h2>Metadata JSON</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(output, null, 2)}</pre>
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