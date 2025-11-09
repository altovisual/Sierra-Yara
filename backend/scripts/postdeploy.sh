#!/bin/bash
# Script de post-deploy para Render

echo "🚀 Ejecutando script post-deploy..."

# Esperar a que MongoDB esté listo
echo "⏳ Esperando conexión a MongoDB..."
sleep 5

# Inicializar tasa BCV si no existe
echo "💱 Inicializando tasa BCV..."
node scripts/inicializarTasaBCV.js || echo "⚠️  Tasa ya existe o error al inicializar"

echo "✅ Post-deploy completado"
