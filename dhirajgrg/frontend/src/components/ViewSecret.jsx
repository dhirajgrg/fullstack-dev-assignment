import { useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/Api";

function ViewSecret() {
  const { token } = useParams();
  const [secret, setSecret] = useState("");
  const [copied, setCopied] = useState(false);
  const [isReveal, setIsReveal] = useState(false);
  const [error, setError] = useState(false);

  const handleReveal = async (e) => {
    e.preventDefault();
    setError(false);
    try {
      const res = await api.post(`/api/v1/secrets/${token}`);

      setSecret(res.data.data.secret);
      console.log(secret)
      setIsReveal(true);
    } catch (error) {
      setError(true);
      console.error("Failed to Fetch reveal", error.message);
    }
  };

  const handleCopySecret = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setSecret("");
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  return (
    <div className="card">
      <h1>Secure Credential Drop</h1>
      <p className="sub">Someone shared a one-time secret with you.</p>

      {error ? (
        <div className="flash flash-err ">
          This secret has already been viewed, has expired, or does not exist.
        </div>
      ) : isReveal ? (
        <div>
          {!copied ? (
            <>
              <div className="flash flash-ok ">
                Secret revealed and permanently deleted from the server.
              </div>
              <div className="box">
                <div className="secret-text">{secret}</div>
              </div>
              <button className="btn btn-ghost" onClick={handleCopySecret}>
                Copy Secret
              </button>
            </>
          ) : (
            <div className="flash flash-ok ">
              Secret copied! This secret is no longer accessible.
            </div>
          )}
        </div>
      ) : (
        <div>
          <p>
            Click below to reveal the secret. It will be{" "}
            <strong>permanently deleted</strong> the moment you do.
          </p>
          <div className="center">
            <button
              className="btn btn-danger"
              type="button"
              onClick={handleReveal}>
              Reveal Secret
            </button>
          </div>
          <p className="notice center">
            Do not click if you are not the intended recipient.
          </p>
        </div>
      )}
    </div>
  );
}

export default ViewSecret;
