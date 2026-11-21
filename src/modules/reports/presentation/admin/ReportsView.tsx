import { Link } from "react-router-dom";
import {
  Users,
  Building2,
  ClipboardList,
  ListOrdered,
  ChevronRight,
} from "lucide-react";

import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import "./ReportsView.css";

const LINKS_REPORTS = [
  {
    label: "Usuarios",
    description: "Consulta y genera reportes de los usuarios registrados.",
    to: "/admin/reports/users",
    icon: Users,
  },
  {
    label: "Propiedades",
    description: "Consulta información de los locales, oficinas y bodegas.",
    to: "/admin/reports/properties",
    icon: Building2,
  },
  {
    label: "Solicitudes",
    description: "Revisa las solicitudes realizadas y sus estados.",
    to: "/admin/reports/requests",
    icon: ClipboardList,
  },
  // {
  //   label: "Lista de espera por propiedad",
  //   description: "Consulta los interesados y su posición en la fila de cada propiedad.",
  //   to: "/admin/reports/waitlist",
  //   icon: ListOrdered,
  // },
];

export default function ReportsView() {
  return (
    <GlowScreen wide>
      <RoleNav />

      <main className="reports-menu__container">
        <p className="reports-menu__eyebrow">Administración</p>
        <header className="reports-menu__heading">
          <h1 className="reports-menu__title">Reportes</h1>
          <p className="reports-menu__description">
            Selecciona el tipo de reporte que deseas consultar o generar.
          </p>
        </header>

        <section className="reports-menu__grid">
          {LINKS_REPORTS.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.to}
                to={item.to}
                className="reports-menu__card"
              >
                <div className="reports-menu__icon">
                  <Icon size={26} />
                </div>

                <div className="reports-menu__content">
                  <h2>{item.label}</h2>
                  <p>{item.description}</p>
                </div>

                <ChevronRight
                  className="reports-menu__arrow"
                  size={22}
                />
              </Link>
            );
          })}
        </section>
      </main>
    </GlowScreen>
  );
}