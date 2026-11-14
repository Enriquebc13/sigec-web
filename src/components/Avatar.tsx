import defaultAvatar from "../assets/avatars/Unknown_person.jpg";
import "./Avatar.css";

type Props = {
  /** URL de la foto; si no se manda, usa la imagen por defecto */
  src?: string;
  alt?: string;
  size?: number;
  margin?: number;
};

export function Avatar({
  src,
  alt = "Foto de perfil",
  size = 200,
  margin = 40,
}: Props) {
  return (
    <img
      src={src ?? defaultAvatar}
      alt={alt}
      className="avatar"
      style={{ width: size, height: size, marginTop: margin }}
    />
  );
}