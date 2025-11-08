// PARTE 1 - Productos del menú Sierra Yara
// Este archivo contiene la primera mitad de los productos

const productosParte1 = [
  // CAFÉ
  { nombre: 'Espresso', descripcion: 'Café espresso italiano intenso', precio: 2.50, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400', disponible: true },
  { nombre: 'Americano', descripcion: 'Espresso con agua caliente', precio: 2.75, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400', disponible: true },
  { nombre: 'Cortado', descripcion: 'Espresso con un toque de leche', precio: 2.80, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400', disponible: true },
  { nombre: 'Capuchino', descripcion: 'Espresso con leche vaporizada y espuma', precio: 3.50, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400', disponible: true },
  { nombre: 'Macchiato', descripcion: 'Espresso con leche espumada', precio: 3.25, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1557006021-b85faa2bc5e2?w=400', disponible: true },
  { nombre: 'Latte', descripcion: 'Espresso con abundante leche vaporizada', precio: 3.75, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400', disponible: true },
  { nombre: 'Latte Canela', descripcion: 'Latte con toque de canela', precio: 4.00, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1578374173705-c08e9f1e3a78?w=400', disponible: true },
  { nombre: 'Latte Vainilla', descripcion: 'Latte con sirope de vainilla', precio: 4.00, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1599639957043-f3aa5c986398?w=400', disponible: true },
  { nombre: 'Mocachino Nutella', descripcion: 'Chocolate, café y Nutella', precio: 4.50, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1578374173705-c08e9f1e3a78?w=400', disponible: true },
  { nombre: 'Frappuccino', descripcion: 'Café helado con crema batida', precio: 5.00, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400', disponible: true },
  { nombre: 'Affogato', descripcion: 'Helado con espresso caliente', precio: 4.75, categoria: 'Café', imagenUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400', disponible: true },
  
  // ICE TEA
  { nombre: 'Sierra Yara Tea', descripcion: 'Té negro, verde, miel, limón, jarabe de goma', precio: 4.50, categoria: 'Ice Tea', imagenUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', disponible: true },
  { nombre: 'Black Tea', descripcion: 'Té negro, limón, hierba luisa, mandarina', precio: 4.25, categoria: 'Ice Tea', imagenUrl: 'https://images.unsplash.com/photo-1594631661960-3347d0f6f1d7?w=400', disponible: true },
  { nombre: 'Frutas Rojas Tea', descripcion: 'Té frutas rojas, naranja, hierba buena', precio: 4.50, categoria: 'Ice Tea', imagenUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400', disponible: true },
  { nombre: 'Citrus Tea', descripcion: 'Té negro, naranja, parchita, hierba buena', precio: 4.50, categoria: 'Ice Tea', imagenUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', disponible: true },
  
  // CROISSANT
  { nombre: 'Croissant Simple', descripcion: 'Croissant francés recién horneado', precio: 2.50, categoria: 'Croissant', imagenUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400', disponible: true },
  { nombre: 'Croissant Sierra', descripcion: 'Jamón de pierna, queso holandés & mayonesa Plein', precio: 4.50, categoria: 'Croissant', imagenUrl: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400', disponible: true },
  { nombre: 'Croissant Caprese', descripcion: 'Queso, mozzarella, tomate, jamón coppa di parma', precio: 5.50, categoria: 'Croissant', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  { nombre: 'Croissant Serrano', descripcion: 'Tomates confitados, aceite de oliva, jamón serrano', precio: 5.75, categoria: 'Croissant', imagenUrl: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=400', disponible: true },
  { nombre: 'Croissant Mariana', descripcion: 'Jamón coppa, queso holandés, rúcula, tomate', precio: 5.50, categoria: 'Croissant', imagenUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400', disponible: true },
  
  // PANINIS
  { nombre: 'Panino Luigi', descripcion: 'Mortadela pistacho & queso holandés, tomate', precio: 5.50, categoria: 'Paninis', imagenUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', disponible: true },
  { nombre: 'Panino Preferito', descripcion: 'Jamón coppa di parma, tomate, lechuga, parmigiano', precio: 6.50, categoria: 'Paninis', imagenUrl: 'https://images.unsplash.com/photo-1509722747041-616f39b57569?w=400', disponible: true },
  { nombre: 'Panino Francesco', descripcion: 'Jamón serrano, queso holandés, aceite de oliva', precio: 6.00, categoria: 'Paninis', imagenUrl: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400', disponible: true },
  
  // FOCACCIA
  { nombre: 'Focaccia Italianísima', descripcion: 'Mortadela pistacho, stracciatella, pesto, tomate cherry', precio: 7.50, categoria: 'Focaccia', imagenUrl: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400', disponible: true },
  { nombre: 'Focaccia Sebita', descripcion: 'Nutella, fresa y azúcar glass', precio: 5.50, categoria: 'Focaccia', imagenUrl: 'https://images.unsplash.com/photo-1586985289688-ca3cf47d3e6e?w=400', disponible: true },
  { nombre: 'Focaccia Tre Formaggio', descripcion: 'Jamón coppa, queso holandés, parmigiano reggiano', precio: 7.00, categoria: 'Focaccia', imagenUrl: 'https://images.unsplash.com/photo-1601924582970-9238bcb495d9?w=400', disponible: true },
  
  // BATIDOS CLÁSICOS
  { nombre: 'Batido de Fresa', descripcion: 'Batido cremoso de fresas frescas', precio: 4.50, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', disponible: true },
  { nombre: 'Batido de Naranja', descripcion: 'Batido refrescante de naranja natural', precio: 4.25, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', disponible: true },
  { nombre: 'Batido de Mora', descripcion: 'Batido de moras frescas', precio: 4.50, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400', disponible: true },
  { nombre: 'Batido de Piña', descripcion: 'Batido tropical de piña fresca', precio: 4.25, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', disponible: true },
  { nombre: 'Batido de Melón', descripcion: 'Batido suave de melón', precio: 4.25, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400', disponible: true },
  { nombre: 'Batido de Parchita', descripcion: 'Batido de maracuyá', precio: 4.50, categoria: 'Batidos Clásicos', imagenUrl: 'https://images.unsplash.com/photo-1514517521153-1be72277b32f?w=400', disponible: true },
  
  // BATIDOS DE LA SIERRA
  { nombre: 'Batido Sierra', descripcion: 'Guanábana, fresa, mandarina, jarabe de goma', precio: 5.50, categoria: 'Batidos de la Sierra', imagenUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', disponible: true },
  { nombre: 'Batido Tropic Punch', descripcion: 'Piña, mango, parchita, jarabe de goma', precio: 5.50, categoria: 'Batidos de la Sierra', imagenUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400', disponible: true },
  { nombre: 'Batido Yara', descripcion: 'Mora, fresa, parchita, jarabe de goma', precio: 5.50, categoria: 'Batidos de la Sierra', imagenUrl: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?w=400', disponible: true },
  { nombre: 'Batido Guanita', descripcion: 'Guanábana, fresa, leche condensada', precio: 5.75, categoria: 'Batidos de la Sierra', imagenUrl: 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400', disponible: true },
  
  // LIMONADAS
  { nombre: 'Limonada Clásica', descripcion: 'Limón, agua, hielo, jarabe de goma', precio: 3.50, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400', disponible: true },
  { nombre: 'Limonada con Jengibre', descripcion: 'Limón, jengibre, hielo, jarabe de goma', precio: 4.00, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', disponible: true },
  { nombre: 'Limonada Natural', descripcion: 'Limón natural sin azúcar', precio: 3.25, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=400', disponible: true },
  { nombre: 'Pink Lemonade', descripcion: 'Limón, fresas, jarabe de goma', precio: 4.25, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', disponible: true },
  { nombre: 'Frenchi Lemonade', descripcion: 'Limón, fresa, miel, jarabe de goma', precio: 4.50, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=400', disponible: true },
  { nombre: 'Hierba Buena', descripcion: 'Limón, menta, hierba buena', precio: 4.00, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', disponible: true },
  { nombre: 'Herbal Lemonade', descripcion: 'Limón, menta, hielo, hierba buena', precio: 4.25, categoria: 'Limonadas', imagenUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400', disponible: true },
];

module.exports = productosParte1;
