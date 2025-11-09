import React, { createContext, useContext, useState, useEffect } from 'react';

const FavoritosContext = createContext();

export const useFavoritos = () => {
  const context = useContext(FavoritosContext);
  if (!context) {
    throw new Error('useFavoritos debe usarse dentro de FavoritosProvider');
  }
  return context;
};

export const FavoritosProvider = ({ children }) => {
  const [favoritos, setFavoritos] = useState(() => {
    // Cargar favoritos del localStorage
    console.log('⭐ Cargando favoritos desde localStorage...');
    const favoritosGuardados = localStorage.getItem('favoritos');
    if (favoritosGuardados) {
      const favs = JSON.parse(favoritosGuardados);
      console.log('✅ Favoritos restaurados:', favs.length, 'productos');
      return favs;
    }
    console.log('❌ No hay favoritos guardados');
    return [];
  });

  // Guardar favoritos en localStorage cuando cambien
  useEffect(() => {
    console.log('💾 Guardando favoritos:', favoritos.length, 'productos');
    localStorage.setItem('favoritos', JSON.stringify(favoritos));
  }, [favoritos]);

  const agregarFavorito = (productoId) => {
    if (!favoritos.includes(productoId)) {
      setFavoritos([...favoritos, productoId]);
      return true;
    }
    return false;
  };

  const quitarFavorito = (productoId) => {
    setFavoritos(favoritos.filter(id => id !== productoId));
  };

  const toggleFavorito = (productoId) => {
    if (favoritos.includes(productoId)) {
      quitarFavorito(productoId);
      return false;
    } else {
      agregarFavorito(productoId);
      return true;
    }
  };

  const esFavorito = (productoId) => {
    return favoritos.includes(productoId);
  };

  const limpiarFavoritos = () => {
    setFavoritos([]);
  };

  return (
    <FavoritosContext.Provider
      value={{
        favoritos,
        agregarFavorito,
        quitarFavorito,
        toggleFavorito,
        esFavorito,
        limpiarFavoritos,
        cantidadFavoritos: favoritos.length
      }}
    >
      {children}
    </FavoritosContext.Provider>
  );
};

export default FavoritosContext;
