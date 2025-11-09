# Script de verificación de conexión para Sierra Yara
# Ejecuta este script en PowerShell para diagnosticar problemas

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  VERIFICACIÓN DE CONEXIÓN SIERRA YARA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Obtener IP de la PC
Write-Host "1. Obteniendo IP de tu PC..." -ForegroundColor Yellow
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"}).IPAddress
if ($ip) {
    Write-Host "   ✅ IP encontrada: $ip" -ForegroundColor Green
    Write-Host "   📱 Usa esta URL en tu celular: http://${ip}:3000" -ForegroundColor Cyan
} else {
    Write-Host "   ❌ No se pudo encontrar la IP local" -ForegroundColor Red
}
Write-Host ""

# 2. Verificar si el puerto 5000 está en uso (backend)
Write-Host "2. Verificando si el backend está corriendo (puerto 5000)..." -ForegroundColor Yellow
$backend = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($backend) {
    Write-Host "   ✅ Backend está corriendo en puerto 5000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Backend NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: cd backend && npm start" -ForegroundColor Yellow
}
Write-Host ""

# 3. Verificar si el puerto 3000 está en uso (frontend)
Write-Host "3. Verificando si el frontend está corriendo (puerto 3000)..." -ForegroundColor Yellow
$frontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($frontend) {
    Write-Host "   ✅ Frontend está corriendo en puerto 3000" -ForegroundColor Green
} else {
    Write-Host "   ❌ Frontend NO está corriendo" -ForegroundColor Red
    Write-Host "   💡 Ejecuta: cd frontend && npm start" -ForegroundColor Yellow
}
Write-Host ""

# 4. Verificar reglas de firewall
Write-Host "4. Verificando reglas de firewall para puerto 5000..." -ForegroundColor Yellow
$firewallRule = Get-NetFirewallRule | Where-Object {$_.DisplayName -like "*5000*" -or $_.DisplayName -like "*Sierra*"}
if ($firewallRule) {
    Write-Host "   ✅ Regla de firewall encontrada" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  No se encontró regla de firewall" -ForegroundColor Yellow
    Write-Host "   💡 Puede que necesites crear una regla o desactivar el firewall temporalmente" -ForegroundColor Yellow
}
Write-Host ""

# 5. Probar conexión al backend
Write-Host "5. Probando conexión al backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/health" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Backend responde correctamente" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ No se pudo conectar al backend" -ForegroundColor Red
    Write-Host "   💡 Verifica que el backend esté corriendo" -ForegroundColor Yellow
}
Write-Host ""

# 6. Resumen
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($ip -and $backend -and $frontend) {
    Write-Host "✅ TODO ESTÁ LISTO" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Desde tu celular (en la misma WiFi):" -ForegroundColor Cyan
    Write-Host "   Abre: http://${ip}:3000" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "❌ HAY PROBLEMAS" -ForegroundColor Red
    Write-Host ""
    if (-not $backend) {
        Write-Host "   • Inicia el backend: cd backend && npm start" -ForegroundColor Yellow
    }
    if (-not $frontend) {
        Write-Host "   • Inicia el frontend: cd frontend && npm start" -ForegroundColor Yellow
    }
    if (-not $ip) {
        Write-Host "   • Verifica tu conexión de red" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "📖 Para más ayuda, lee: DIAGNOSTICO.md" -ForegroundColor Cyan
Write-Host ""
