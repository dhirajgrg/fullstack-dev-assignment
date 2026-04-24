import { useState } from "react";
import api from '../api/Api'


function CreateSecret() {
  const [secret, setSecret] = useState("");
  const [expires, setExpires] = useState("3600");
  const [customValue, setCustomValue] = useState("");
  const [generatedLink, setGeneratedLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [error,setError]=useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false)

    try {
      const finalExpires = expires === "custom" ? customValue : expires;

      const res = await api.post(
        `/api/v1/secrets`,
        {
          secret,
          expiresSecretTimes: finalExpires,
        },
      );

      console.log("====Secret created==== :", res.data);

      const url = res.data.url;
      setGeneratedLink(url);

      console.log(generatedLink)
      setSecret("");
      setExpires("1");
      setCustomValue("");
    } catch (error) {
      setError(true)
      console.error("Error creating secret:", error);
    }
  };
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div className="card">
      <h1>Secure Credential Drop</h1>
      <p>
        Share a password or API key via a link that self-destructs on first
        view.
      </p>
      {error && (
        <div className="flash flash-err ">
          Something went wrong while creating your secret. Please try again.
        </div>
      )}
      <form className="create_form" onSubmit={handleSubmit}>
        <label>Secret</label>
        <textarea
          placeholder="Enter your credential here"
          required
          value={secret}
          onChange={(e) => setSecret(e.target.value)}></textarea>
        <div className="row">
          <div className="field">
            <label>expires after</label>
            <select
              required
              value={expires}
              onChange={(e) => setExpires(e.target.value)}>
              <option value="3600">1 hour</option>
              <option value="86400">24 hours</option>
              <option value="604800">1 week</option>
              <option value="custom">custom...</option>
            </select>
          </div>
          {expires === "custom" && (
            <div className="field">
              <label>seconds</label>
              <input
                type="number"
                placeholder="eg. 7200"
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
              />
            </div>
          )}

          <button className="btn" type="submit">
            Generate Link
          </button>
        </div>
      </form>
      {generatedLink && generatedLink.trim() !== "" ? (
        <div className="box">
          <label>One-time link — share this</label>
          <div className="link-text">{generatedLink}</div>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "0.8rem", padding: "0.4rem 0.9rem" }}
            onClick={handleCopyLink}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
          <p
            className="notice"
            style={{ marginTop: "1rem", fontSize: "0.8rem" }}>
            ⚠ This link works <strong>exactly once</strong>. Copy it before
            sharing.
          </p>
        </div>
      ) : null}
    </div>
  );
}

export default CreateSecret;
