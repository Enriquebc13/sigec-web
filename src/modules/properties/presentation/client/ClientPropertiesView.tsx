import { GlowScreen } from "../../../../components/GlowScreen";
import { RoleNav } from "../../../auth/presentation/components/RoleNav";
import { PropertyCatalog } from "../shared/PropertyCatalog";
import "../admin/PropertiesView.css"; // reutiliza el encabezado del admin

export function ClientPropertiesView() {
  return (
    <GlowScreen wide>
      <RoleNav />

      <section className="properties__container">
        <div className="properties__heading">
          <div>
            <p className="properties__eyebrow">Catálogo</p>
            <h1 className="properties__title">Propiedades</h1>
          </div>
        </div>

        <PropertyCatalog />
      </section>
    </GlowScreen>
  );
}