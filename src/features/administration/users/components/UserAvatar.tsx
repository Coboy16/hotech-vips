import React from "react";

interface UserAvatarProps {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string | null;
  size?: number; // Tamaño en píxeles
  className?: string; // Clases adicionales para el contenedor
}

const UserAvatar: React.FC<UserAvatarProps> = ({
  firstName = "",
  lastName = "",
  avatarUrl,
  size = 40, // Tamaño por defecto (w-10 h-10)
  className = "",
}) => {
  const getInitials = () => {
    const firstInitial = firstName?.charAt(0).toUpperCase() || "";
    const lastInitial = lastName?.charAt(0).toUpperCase() || "";
    if (!firstInitial && !lastInitial) {
      return "?";
    }
    return `${firstInitial}${lastInitial}`;
  };

  const initials = getInitials();

  // Generar un color de fondo basado en las iniciales o nombre
  const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash;
    }
    const color = `hsl(${hash % 360}, 70%, 80%)`; // Background color
    const textColor = `hsl(${hash % 360}, 70%, 30%)`; // Text color
    return { backgroundColor: color, color: textColor };
  };

  const { backgroundColor, color: textColor } = stringToColor(
    firstName + lastName || "default"
  );

  const sizeStyle = {
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.max(12, size / 2.5)}px`, // Ajustar tamaño de fuente
  };

  // Estado para controlar si la imagen falló al cargar
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    // Resetear el error si la url del avatar cambia
    setImgError(false);
  }, [avatarUrl]);

  const showInitials = !avatarUrl || imgError;

  return (
    <div
      className={`rounded-full flex items-center justify-center object-cover font-semibold ${className}`}
      style={sizeStyle}
      title={`${firstName} ${lastName}`}
    >
      {showInitials ? (
        <div
          className="w-full h-full rounded-full flex items-center justify-center"
          style={{ backgroundColor, color: textColor }}
        >
          {initials}
        </div>
      ) : (
        <img
          src={avatarUrl} // Sabemos que avatarUrl no es null/undefined aquí
          alt={`${firstName} ${lastName}`}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImgError(true)} // Marcar error si la imagen no carga
        />
      )}
    </div>
  );
};

export default UserAvatar;
