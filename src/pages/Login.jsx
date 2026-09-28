import { useState } from "react";

import {
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export default function Login() {
  const {
    login,
    isAuthenticated,
  } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] =
    useState("admin@sotreg.ma");

  const [password, setPassword] =
    useState("Sotreg2026!");

  const [error, setError] =
    useState("");

  if (isAuthenticated) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }

  function handleSubmit(e) {
    e.preventDefault();

    setError("");

    const result =
      login(email, password);

    if (!result.success) {
      setError(result.message);
      return;
    }

    navigate(
      location.state?.from || "/",
      { replace: true }
    );
  }

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-brand">
          <div className="login-brand-icon">
            S
          </div>

          <div>
            <strong>
              SOTREG Analytics
            </strong>

            <span>
              Supervision du transport
            </span>
          </div>
        </div>

        <div className="login-content">

          <span className="kicker">
            ESPACE SÉCURISÉ
          </span>

          <h1>Connexion</h1>

          <p>
            Accédez à votre espace de supervision
            et aux indicateurs de transport.
          </p>

        </div>

        <form
          className="login-form"
          onSubmit={handleSubmit}
        >

          <label>
            Adresse e-mail

            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </label>

          <label>
            Mot de passe

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </label>

          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="login-button"
          >
            Se connecter
          </button>

        </form>

        <div className="login-demo">
          <strong>
            Compte de démonstration
          </strong>

          <span>
            admin@sotreg.ma
          </span>

          <span>
            Sotreg2026!
          </span>
        </div>

      </div>

    </div>
  );
}