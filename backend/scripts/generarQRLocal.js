const os = require('os');

/**
 * Script para generar códigos QR para las mesas usando la IP local
 * Útil para pruebas en dispositivos móviles en la misma red
 */

// Obtener la IP local
function obtenerIPLocal() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Buscar IPv4 que no sea localhost
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

function generarQRMesas(cantidadMesas = 10) {
  const ipLocal = obtenerIPLocal();
  const BASE_URL = `http://${ipLocal}:3000`;
  
  console.log('\n🏔️  Sierra Yara Café - Códigos QR para Pruebas\n');
  console.log('═'.repeat(70));
  console.log(`\n📡 IP Local detectada: ${ipLocal}`);
  console.log(`🌐 URL Base: ${BASE_URL}\n`);
  console.log('═'.repeat(70));
  
  for (let i = 1; i <= cantidadMesas; i++) {
    const url = `${BASE_URL}/mesa/${i}`;
    const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
    
    console.log(`\n📍 Mesa ${i}:`);
    console.log(`   URL: ${url}`);
    console.log(`   QR:  ${qrURL}`);
  }
  
  console.log('\n' + '═'.repeat(70));
  console.log('\n📱 Instrucciones para Pruebas:');
  console.log('   1. Asegúrate que tu celular esté en la misma red WiFi');
  console.log(`   2. Verifica que el frontend esté corriendo en ${BASE_URL}`);
  console.log(`   3. Verifica que el backend esté corriendo en http://${ipLocal}:5000`);
  console.log('   4. Abre las URLs "QR" en tu navegador para ver los códigos');
  console.log('   5. Escanea con tu celular');
  
  console.log('\n💡 Opciones para generar QR:');
  console.log('   • Opción 1: Abre las URLs "QR" y guarda las imágenes');
  console.log('   • Opción 2: Usa https://www.qr-code-generator.com/');
  console.log('   • Opción 3: Usa una app de generación de QR en tu celular');
  
  console.log('\n⚙️  Configuración necesaria:');
  console.log(`   • Frontend .env debe tener:`);
  console.log(`     REACT_APP_API_URL=http://${ipLocal}:5000/api`);
  console.log(`     REACT_APP_SOCKET_URL=http://${ipLocal}:5000`);
  console.log(`   • Backend debe escuchar en 0.0.0.0:5000`);
  console.log(`   • CORS debe permitir http://${ipLocal}:3000\n`);
  
  // Generar archivo HTML con todos los QR
  console.log('═'.repeat(70));
  console.log('\n📄 Generando archivo HTML con QR codes...\n');
  
  const htmlContent = `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sierra Yara Café - Códigos QR</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        h1 {
            text-align: center;
            color: #2c3e50;
        }
        .info {
            background: white;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 20px;
        }
        .qr-card {
            background: white;
            padding: 20px;
            border-radius: 10px;
            text-align: center;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            page-break-inside: avoid;
        }
        .qr-card h2 {
            margin-top: 0;
            color: #3498db;
        }
        .qr-card img {
            max-width: 100%;
            height: auto;
            border: 2px solid #3498db;
            border-radius: 5px;
        }
        .url {
            font-size: 12px;
            color: #7f8c8d;
            word-break: break-all;
            margin-top: 10px;
        }
        @media print {
            body {
                background: white;
            }
            .info {
                display: none;
            }
            .qr-card {
                box-shadow: none;
                border: 1px solid #ddd;
            }
        }
    </style>
</head>
<body>
    <h1>🏔️ Sierra Yara Café - Códigos QR</h1>
    
    <div class="info">
        <h3>📡 Información de Red</h3>
        <p><strong>IP Local:</strong> ${ipLocal}</p>
        <p><strong>URL Base:</strong> ${BASE_URL}</p>
        <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <hr>
        <h4>📱 Instrucciones:</h4>
        <ol>
            <li>Asegúrate que tu celular esté en la misma red WiFi</li>
            <li>Escanea el código QR de la mesa correspondiente</li>
            <li>Selecciona tu nombre y comienza a ordenar</li>
        </ol>
    </div>
    
    <div class="grid">
${Array.from({ length: cantidadMesas }, (_, i) => {
  const mesaNum = i + 1;
  const url = `${BASE_URL}/mesa/${mesaNum}`;
  const qrURL = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url)}`;
  return `        <div class="qr-card">
            <h2>Mesa ${mesaNum}</h2>
            <img src="${qrURL}" alt="QR Mesa ${mesaNum}">
            <p class="url">${url}</p>
        </div>`;
}).join('\n')}
    </div>
</body>
</html>
  `;
  
  const fs = require('fs');
  const path = require('path');
  const outputPath = path.join(__dirname, '..', '..', 'qr-codes.html');
  
  fs.writeFileSync(outputPath, htmlContent);
  console.log(`✅ Archivo generado: ${outputPath}`);
  console.log('   Abre este archivo en tu navegador para ver todos los QR codes\n');
}

// Ejecutar
const cantidadMesas = process.argv[2] || 10;
generarQRMesas(parseInt(cantidadMesas));
