# Script para verificar que el sistema de Tasa BCV esté funcionando
# Ejecutar: .\verificar-tasa-bcv.ps1

$API_URL = "https://sierra-yara.onrender.com/api"

Write-Host "🔍 Verificando Sistema de Tasa BCV..." -ForegroundColor Cyan
Write-Host ""

# Test 1: Obtener tasa actual
Write-Host "Test 1: Obtener tasa actual" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/tasa-bcv/actual" -Method Get
    if ($response.success) {
        Write-Host "✅ Tasa actual: Bs. $($response.data.valor)" -ForegroundColor Green
        Write-Host "   Fuente: $($response.data.fuente)" -ForegroundColor Gray
        Write-Host "   Actualizado por: $($response.data.actualizadoPor)" -ForegroundColor Gray
        Write-Host "   Fecha: $($response.data.createdAt)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al obtener tasa: $_" -ForegroundColor Red
}
Write-Host ""

# Test 2: Obtener histórico
Write-Host "Test 2: Obtener histórico (últimas 5 tasas)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/tasa-bcv/historico?limite=5" -Method Get
    if ($response.success) {
        Write-Host "✅ Histórico obtenido: $($response.count) registros" -ForegroundColor Green
        foreach ($tasa in $response.data) {
            Write-Host "   Bs. $($tasa.valor) - $($tasa.fuente) - $($tasa.createdAt)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al obtener histórico: $_" -ForegroundColor Red
}
Write-Host ""

# Test 3: Obtener estadísticas
Write-Host "Test 3: Obtener estadísticas (últimos 30 días)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/tasa-bcv/estadisticas?dias=30" -Method Get
    if ($response.success) {
        Write-Host "✅ Estadísticas obtenidas:" -ForegroundColor Green
        Write-Host "   Promedio: Bs. $($response.data.promedio)" -ForegroundColor Gray
        Write-Host "   Mínima: Bs. $($response.data.minima)" -ForegroundColor Gray
        Write-Host "   Máxima: Bs. $($response.data.maxima)" -ForegroundColor Gray
        Write-Host "   Actual: Bs. $($response.data.actual)" -ForegroundColor Gray
        Write-Host "   Cambio total: $($response.data.cambioTotal)" -ForegroundColor Gray
        Write-Host "   Actualizaciones: $($response.data.cantidadActualizaciones)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Error: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error al obtener estadísticas: $_" -ForegroundColor Red
}
Write-Host ""

# Test 4: Verificar conversión USD a Bs
Write-Host "Test 4: Verificar conversión USD a Bs" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_URL/tasa-bcv/actual" -Method Get
    if ($response.success) {
        $tasa = $response.data.valor
        $precioUSD = 0.50
        $precioBs = $precioUSD * $tasa
        
        Write-Host "✅ Conversión:" -ForegroundColor Green
        Write-Host "   Precio USD: `$$precioUSD" -ForegroundColor Gray
        Write-Host "   Tasa BCV: Bs. $tasa" -ForegroundColor Gray
        Write-Host "   Precio Bs: Bs. $([math]::Round($precioBs, 2))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error en conversión: $_" -ForegroundColor Red
}
Write-Host ""

# Resumen
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ Verificación completada" -ForegroundColor Green
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Próximos pasos:" -ForegroundColor Yellow
Write-Host "1. Verificar que el cron job esté corriendo (revisar logs en Render)" -ForegroundColor White
Write-Host "2. Integrar la tasa en el frontend para mostrar precios duales" -ForegroundColor White
Write-Host "3. Crear panel de administración para gestionar la tasa" -ForegroundColor White
Write-Host ""
