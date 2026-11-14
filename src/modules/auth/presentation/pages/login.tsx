import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, LockKeyhole, Eye, EyeOff } from "lucide-react";
import { ApiError } from "../../../../core/http/api-client";

import { postLoginPath } from "../home-by-role";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const state = location.state as {
    registered?: boolean;
    from?: string;
  } | null;

  const justRegistered = state?.registered;
  const from = state?.from;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const user = await login({ email, password });
      navigate(postLoginPath(user.role, from), { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Correo o contraseña incorrectos");
      } else if (err instanceof TypeError) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(
          err instanceof Error ? err.message : "No se pudo iniciar sesión"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth__section-title">Inicio de sesión</h2>
      <p className="auth__hint">
        Ingresa tus datos para acceder al sistema.
      </p>

      {from && (
        <p className="auth__info" role="status">
          Inicia sesión o crea una cuenta para enviar tu solicitud.
        </p>
      )}

      {justRegistered && (
        <p className="auth__success" role="status">
          Cuenta creada. Ya puedes iniciar sesión.
        </p>
      )}

      <form className="auth__form" onSubmit={handleSubmit}>
        <label className="auth__label" htmlFor="email">
          Correo electrónico
        </label>

        <div className="auth__input-wrapper">
          <Mail className="auth__input-icon" size={19} />
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="auth__input auth__input--icon"
            placeholder="ejemplo@correo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

     <label className="auth__label" htmlFor="password">
  Contraseña
</label>

<div className="auth__input-wrapper">
  <LockKeyhole className="auth__input-icon" size={19} />

  <input
    id="password"
    type={showPassword ? "text" : "password"}
    autoComplete="current-password"
    className="auth__input auth__input--password"
    placeholder="Ingresa tu contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
  />

  <button
    type="button"
    className="auth__password-toggle"
    onClick={() => setShowPassword(!showPassword)}
    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
  >
    {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
  </button>
</div>

        {error && (
          <p className="auth__error" role="alert">
            {error}
          </p>
        )}

        <button type="submit" className="auth__button" disabled={loading}>
          {loading ? "Entrando..." : "Enviar"}
        </button>
      </form>

      <Link to="/register" state={{ from }} className="auth__link">
        ¿No tienes cuenta? Regístrate
      </Link>
    </AuthLayout>
  );
}