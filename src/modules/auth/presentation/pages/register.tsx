
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  UserRound,
  Mail,
  LockKeyhole,
  Eye,
  EyeOff,
} from "lucide-react";
import { ApiError } from "../../../../core/http/api-client";
import { AuthLayout } from "../components/AuthLayout";
import { useAuth } from "../hooks/useAuth";
import "./register.css";

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Sin role: la API asigna CLIENT por defecto
      await register({
        name: nombre,
        lastname: apellido,
        email,
        password,
      });

      navigate("/login", {
        replace: true,
        state: { registered: true },
      });
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("Ese correo ya está registrado");
      } else if (err instanceof TypeError) {
        setError("No se pudo conectar con el servidor");
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "No se pudo crear la cuenta"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h2 className="auth__section-title">¡Bienvenido!</h2>
      <p className="auth__hint">Regístrate para comenzar</p>

      <form className="auth__form" onSubmit={handleSubmit}>
        <div className="register__row">
          <div className="register__field">
            <label className="auth__label" htmlFor="nombre">
              Nombre
            </label>

            <div className="auth__input-wrapper">
              <User className="auth__input-icon" size={19} />
              <input
                id="nombre"
                type="text"
                autoComplete="given-name"
                className="auth__input auth__input--icon"
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="register__field">
            <label className="auth__label" htmlFor="apellido">
              Apellido
            </label>

            <div className="auth__input-wrapper">
              <UserRound className="auth__input-icon" size={19} />
              <input
                id="apellido"
                type="text"
                autoComplete="family-name"
                className="auth__input auth__input--icon"
                placeholder="Ingresa tu apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </div>
          </div>
        </div>

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
            autoComplete="new-password"
            className="auth__input auth__input--icon auth__input--password"
            placeholder="Mínimo 8 caracteres"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />

          <button
            type="button"
            className="auth__password-toggle"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
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
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <Link to="/login" className="auth__link">
        ¿Ya tienes cuenta? Inicia sesión
      </Link>
    </AuthLayout>
  );
}
