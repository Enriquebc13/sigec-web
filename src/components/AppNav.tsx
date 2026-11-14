// import { Link, useLocation } from "react-router-dom";
// import logoSigec from "../assets/logo-sigec.svg";
// import "./AppNav.css";

// export type NavItem = {
//   label: string;
//   to: string;
// };

// type Props = {
//   links: NavItem[];
//   /** A dónde lleva el logo */
//   homePath: string;
//   onLogout?: () => void;
//   /**
//    * true (por defecto): el enlace de la pantalla actual no se muestra.
//    * false: se muestra resaltado.
//    */
//   hideCurrent?: boolean;
// };

// // "/client/properties" coincide con sí misma y con sus subrutas
// const isCurrent = (pathname: string, to: string) =>
//   pathname === to || pathname.startsWith(`${to}/`);

// export function AppNav({
//   links,
//   homePath,
//   onLogout,
//   hideCurrent = true,
// }: Props) {
//   const { pathname } = useLocation();

//   const visible = hideCurrent
//     ? links.filter((link) => !isCurrent(pathname, link.to))
//     : links;

//   return (
//     <header className="appnav">
//       <Link to={homePath} className="appnav__brand">
//         <img src={logoSigec} alt="" width="36" height="36" />
//         <span>SIGEC</span>
//       </Link>

//       <nav className="appnav__links" aria-label="Navegación principal">
//         {visible.map((link) => {
//           const current = isCurrent(pathname, link.to);
//           return (
//             <Link
//               key={link.to}
//               to={link.to}
//               className={current ? "appnav__link--active" : undefined}
//               aria-current={current ? "page" : undefined}
//             >
//               {link.label}
//             </Link>
//           );
//         })}
//       </nav>

//       {onLogout && (
//         <button type="button" className="appnav__logout" onClick={onLogout}>
//           Cerrar sesión
//         </button>
//       )}
//     </header>
//   );
// }

// ------------------------------------NUEVO-----------------------------------------------------

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logoSigec from "../assets/logo-sigec.svg";
import { ConfirmDialog } from "./ConfirmDialog";
import "./AppNav.css";

export type NavItem = {
  label: string;
  to: string;
};

type Props = {
  links: NavItem[];
  homePath: string;
  onLogout?: () => void;
  hideCurrent?: boolean;
};

const isCurrent = (pathname: string, to: string) =>
  pathname === to || pathname.startsWith(`${to}/`);

export function AppNav({
  links,
  homePath,
  onLogout,
  hideCurrent = true,
}: Props) {
  const { pathname } = useLocation();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const visible = hideCurrent
    ? links.filter((link) => !isCurrent(pathname, link.to))
    : links;

  const handleLogout = () => {
    setConfirmingLogout(false);
    onLogout?.();
  };

  return (
    <>
      <header className="appnav">
        <Link to={homePath} className="appnav__brand">
          <img src={logoSigec} alt="" width="36" height="36" />
          <span>SIGEC</span>
        </Link>

        <nav className="appnav__links" aria-label="Navegación principal">
          {visible.map((link) => {
            const current = isCurrent(pathname, link.to);

            return (
              <Link
                key={link.to}
                to={link.to}
                className={current ? "appnav__link--active" : undefined}
                aria-current={current ? "page" : undefined}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {onLogout && (
          <button
            type="button"
            className="appnav__logout"
            onClick={() => setConfirmingLogout(true)}
          >
            Cerrar sesión
          </button>
        )}
      </header>

      {confirmingLogout && (
        <ConfirmDialog
          title="Cerrar sesión"
          message="¿Estás seguro de que quieres salir de tu cuenta?"
          confirmLabel="Sí, cerrar sesión"
          cancelLabel="Cancelar"
          onConfirm={handleLogout}
          onCancel={() => setConfirmingLogout(false)}
        />
      )}
    </>
  );
}
