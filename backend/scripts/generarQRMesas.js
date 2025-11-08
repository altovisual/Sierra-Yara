/**
 * Script para generar códigos QR para las mesas
 * Nota: Este script muestra las URLs. Para generar imágenes QR reales,
 * puedes usar servicios como qr-code-generator.com o bibliotecas como 'qrcode'
 */

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

function generarURLsMesas(cantidadMesas = 10) {
  console.log('\n🏔️  Sierra Yara Café - URLs para Códigos QR\n');
  console.log('═'.repeat(60));
  
  for (let i = 1; i <= cantidadMesas; i++) {
    const url = `${BASE_URL}/mesa/${i}`;
    console.log(`\nMesa ${i}:`);
    console.log(`URL: ${url}`);
    console.log(`QR Online: https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`);
  }
  
  console.log('\n' + '═'.repeat(60));
  console.log('\n📱 Instrucciones:');
  console.log('1. Copia las URLs de arriba');
  console.log('2. Genera códigos QR en: https://www.qr-code-generator.com/');
  console.log('3. O usa las URLs "QR Online" para descargar directamente');
  console.log('4. Imprime y coloca en cada mesa\n');
  
  console.log('💡 Tip: Para producción, actualiza BASE_URL con tu dominio real\n');
}

// Ejecutar
const cantidadMesas = process.argv[2] || 10;
generarURLsMesas(parseInt(cantidadMesas));
