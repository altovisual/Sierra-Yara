// PARTE 2 - Productos del menú Sierra Yara
// Este archivo contiene la segunda mitad de los productos

const productosParte2 = [
  // BEBIDAS
  { nombre: 'Refresco', descripcion: 'Bebida gaseosa fría', precio: 2.00, categoria: 'Bebidas', imagenUrl: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400', disponible: true },
  { nombre: 'Gaseosa', descripcion: 'Gaseosa en lata', precio: 2.25, categoria: 'Bebidas', imagenUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400', disponible: true },
  { nombre: 'Energizante', descripcion: 'Bebida energética', precio: 3.50, categoria: 'Bebidas', imagenUrl: 'https://images.unsplash.com/photo-1622543925917-763c34f1f0a4?w=400', disponible: true },
  { nombre: 'Sparkly', descripcion: 'Agua con gas saborizada', precio: 2.75, categoria: 'Bebidas', imagenUrl: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=400', disponible: true },
  
  // CACHITOS
  { nombre: 'Cachito de Jamón y Queso', descripcion: 'Cachito venezolano con jamón y queso', precio: 2.50, categoria: 'Cachitos', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Cachito de Jamón y Tocineta', descripcion: 'Cachito con jamón y tocineta crujiente', precio: 2.75, categoria: 'Cachitos', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Cachito de Jamón y Queso Crema', descripcion: 'Cachito con jamón y queso crema', precio: 2.75, categoria: 'Cachitos', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Cachito de Mortadela Pistacho', descripcion: 'Cachito gourmet con mortadela de pistacho', precio: 3.00, categoria: 'Cachitos', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  
  // PASTELERÍA & GALLETERÍA
  { nombre: 'Galletas Surtidas (6 unidades)', descripcion: 'Selección de 6 galletas artesanales', precio: 5.00, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', disponible: true },
  { nombre: 'Chocochip', descripcion: 'Galleta clásica con chips de chocolate', precio: 1.50, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', disponible: true },
  { nombre: 'Brownie', descripcion: 'Brownie de chocolate intenso', precio: 3.00, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400', disponible: true },
  { nombre: 'Marquesa de Chocolate', descripcion: 'Postre tradicional venezolano', precio: 4.50, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', disponible: true },
  { nombre: 'Signature Cookie Nutella', descripcion: 'Galleta gourmet con Nutella y avellanas', precio: 2.50, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', disponible: true },
  { nombre: 'Signature Cookie NY', descripcion: 'Galleta estilo Nueva York', precio: 2.25, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400', disponible: true },
  { nombre: 'Signature Cookie Style', descripcion: 'Galleta de autor con estilo único', precio: 2.50, categoria: 'Pastelería & Galletería', imagenUrl: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400', disponible: true },
  
  // TORTAS FRÍAS
  { nombre: 'Tres Leches', descripcion: 'Clásico pastel de tres leches', precio: 4.50, categoria: 'Tortas Frías', imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', disponible: true },
  { nombre: 'Tiramisú', descripcion: 'Postre italiano con café y mascarpone', precio: 5.00, categoria: 'Tortas Frías', imagenUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400', disponible: true },
  { nombre: 'Marquesa de Fresa', descripcion: 'Marquesa con fresas frescas', precio: 4.75, categoria: 'Tortas Frías', imagenUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400', disponible: true },
  { nombre: 'Mousse de Chocolate', descripcion: 'Mousse suave de chocolate belga', precio: 4.50, categoria: 'Tortas Frías', imagenUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400', disponible: true },
  { nombre: 'Quesillo', descripcion: 'Flan venezolano tradicional', precio: 3.50, categoria: 'Tortas Frías', imagenUrl: 'https://images.unsplash.com/photo-1587241321921-91ffe2f48f46?w=400', disponible: true },
  
  // PASTELES
  { nombre: 'Zanahoria', descripcion: 'Pastel de zanahoria con frosting de queso crema', precio: 4.00, categoria: 'Pasteles', imagenUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', disponible: true },
  { nombre: 'Red Velvet', descripcion: 'Clásico pastel red velvet', precio: 4.50, categoria: 'Pasteles', imagenUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400', disponible: true },
  { nombre: 'Limón & Amapola', descripcion: 'Pastel de limón con semillas de amapola', precio: 4.25, categoria: 'Pasteles', imagenUrl: 'https://images.unsplash.com/photo-1519915212116-7cfef71f1d3e?w=400', disponible: true },
  
  // MUFFINS
  { nombre: 'Muffin Banana y Chocolate', descripcion: 'Muffin de banana con chips de chocolate', precio: 3.00, categoria: 'Muffins', imagenUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=400', disponible: true },
  
  // HELADERÍA
  { nombre: 'Helado 1 Porción', descripcion: 'Una bola de helado artesanal', precio: 3.00, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', disponible: true },
  { nombre: 'Helado de Fresa', descripcion: 'Helado cremoso de fresa', precio: 3.50, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?w=400', disponible: true },
  { nombre: 'Helado de Chocolate', descripcion: 'Helado de chocolate belga', precio: 3.50, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', disponible: true },
  { nombre: 'Helado de Mantecado', descripcion: 'Helado de vainilla tradicional', precio: 3.25, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?w=400', disponible: true },
  { nombre: 'Helado 2 Porciones', descripcion: 'Dos bolas de helado a elección', precio: 5.50, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', disponible: true },
  { nombre: 'Pinolino', descripcion: 'Helado tradicional venezolano', precio: 3.75, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', disponible: true },
  { nombre: 'Brownie con Helado', descripcion: 'Brownie caliente con helado', precio: 5.50, categoria: 'Heladería', imagenUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=400', disponible: true },
  
  // PANADERÍA
  { nombre: 'Bollo Nutella', descripcion: 'Pan dulce relleno de Nutella', precio: 2.50, categoria: 'Panadería', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  
  // MENÚ SALUDABLE - SANDWICHES/WRAPS
  { nombre: 'Pan Sandwich Integral', descripcion: 'Pan integral para sandwich', precio: 1.50, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Wrap Integral', descripcion: 'Tortilla integral', precio: 1.75, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400', disponible: true },
  { nombre: 'Focaccia Saludable', descripcion: 'Focaccia integral', precio: 2.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400', disponible: true },
  { nombre: 'Jamón de Pavo', descripcion: 'Jamón de pavo bajo en grasa', precio: 2.50, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Jamón de Pierna', descripcion: 'Jamón de pierna natural', precio: 2.25, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Atún', descripcion: 'Atún en agua', precio: 2.75, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=400', disponible: true },
  { nombre: 'Queso Cabra', descripcion: 'Queso de cabra fresco', precio: 3.50, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', disponible: true },
  { nombre: 'Queso Paisa', descripcion: 'Queso blanco fresco', precio: 2.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', disponible: true },
  { nombre: 'Queso Holandés', descripcion: 'Queso amarillo tipo holandés', precio: 2.25, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', disponible: true },
  { nombre: 'Queso Crema', descripcion: 'Queso crema suave', precio: 2.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400', disponible: true },
  { nombre: 'Lechuga', descripcion: 'Lechuga fresca', precio: 1.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1556801712-76c8eb07bbc9?w=400', disponible: true },
  { nombre: 'Tomate', descripcion: 'Tomate fresco en rodajas', precio: 1.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400', disponible: true },
  { nombre: 'Rúcula', descripcion: 'Rúcula fresca', precio: 1.50, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400', disponible: true },
  { nombre: 'Cebolla', descripcion: 'Cebolla fresca', precio: 0.75, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=400', disponible: true },
  { nombre: 'Aceituna', descripcion: 'Aceitunas negras', precio: 1.25, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1604908815595-2d8a955a6d0e?w=400', disponible: true },
  { nombre: 'Aceite de Oliva', descripcion: 'Aceite de oliva extra virgen', precio: 1.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400', disponible: true },
  { nombre: 'Pesto', descripcion: 'Salsa pesto casera', precio: 1.50, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400', disponible: true },
  { nombre: 'Yogurt', descripcion: 'Yogurt natural', precio: 2.00, categoria: 'Menú Saludable', imagenUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', disponible: true },
  
  // ENSALADAS
  { nombre: 'Ensalada Sierra', descripcion: 'Mix de lechuga, tomate cherry, crotones de focaccia y queso de cabra', precio: 6.50, categoria: 'Ensaladas', imagenUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400', disponible: true },
  { nombre: 'Ensalada Yara', descripcion: 'Mix de lechuga, tomate, cebolla, crotones, atún, aceitunas', precio: 6.00, categoria: 'Ensaladas', imagenUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', disponible: true },
  { nombre: 'Bowl de Frutas', descripcion: 'Frutas variadas de temporada', precio: 5.00, categoria: 'Ensaladas', imagenUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', disponible: true },
  { nombre: 'Parfait', descripcion: 'Yogurt griego, frutas, granola maní, pistacho, coco, nueces', precio: 5.50, categoria: 'Ensaladas', imagenUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400', disponible: true },
  
  // CHARCUTERIE
  { nombre: 'Tabla del Gordo', descripcion: 'Selección de embutidos y quesos artesanales', precio: 12.00, categoria: 'Charcuterie', imagenUrl: 'https://images.unsplash.com/photo-1553163147-622ab57be1c7?w=400', disponible: true },
];

module.exports = productosParte2;
