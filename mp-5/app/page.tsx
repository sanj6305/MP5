
"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [error, setError] = useState("");


async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
  e.preventDefault();

  const response = await fetch("/api/shorten", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url, alias }),
  });

  const data = await response.json();
  console.log(data);

  setError("");
  setShortUrl("");

  //displays error messages for duplicate alias
  if (!response.ok) {
    setError(data.error || "Something went wrong");
    return;
  }
  if (response.ok) {
    setShortUrl(data.shortUrl);
  }

}

  return (
    <main>
      <h1>URL Shortener</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Enter URL:</label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label>Enter Alias:</label>
          <input
            type="text"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="my-link"
          />
        </div>

        <button type="submit">Shorten URL</button>
      </form>
      {shortUrl && <p>Shortened URL: {shortUrl}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </main>
  );
}
