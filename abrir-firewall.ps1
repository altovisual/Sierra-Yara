# Script para abrir el puerto 5000 en el Firewall de Windows
# EJECUTA ESTE SCRIPT COMO ADMINISTRADOR

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ABRIR PUERTO 5000 EN FIREWALL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si se está ejecutando como administrador
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ ERROR: Este script debe ejecutarse como ADMINISTRADOR" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pasos:" -ForegroundColor Yellow
    Write-Host "1. Haz clic derecho en PowerShell" -ForegroundColor White
    Write-Host "2. Selecciona 'Ejecutar como administrador'" -ForegroundColor White
    Write-Host "3. Navega a esta carpeta: cd c:\Users\altov\Downloads\sierra_yara" -ForegroundColor White
    Write-Host "4. Ejecuta: .\abrir-firewall.ps1" -ForegroundColor White
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Ejecutando como administrador" -ForegroundColor Green
Write-Host ""

# Verificar si la regla ya existe
$existingRule = Get-NetFirewallRule -DisplayName "Sierra Yara Backend" -ErrorAction SilentlyContinue

if ($existingRule) {
    Write-Host "⚠️  La regla 'Sierra Yara Backend' ya existe" -ForegroundColor Yellow
    Write-Host "   Eliminando regla anterior..." -ForegroundColor Yellow
    Remove-NetFirewallRule -DisplayName "Sierra Yara Backend"
    Write-Host "   ✅ Regla anterior eliminada" -ForegroundColor Green
    Write-Host ""
}

# Crear nueva regla para el puerto 5000
Write-Host "📝 Creando regla de firewall para el puerto 5000..." -ForegroundColor Yellow

try {
    New-NetFirewallRule -DisplayName "Sierra Yara Backend" `
                        -Direction Inbound `
                        -Protocol TCP `
                        -LocalPort 5000 `
                        -Action Allow `
                        -Profile Any `
                        -Description "Permite conexiones al backend de Sierra Yara en el puerto 5000"
    
    Write-Host "✅ Regla de firewall creada exitosamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  CONFIGURACIÓN COMPLETADA" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ El puerto 5000 ahora está abierto" -ForegroundColor Green
    Write-Host "✅ Puedes acceder desde tu celular" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 URL para tu celular:" -ForegroundColor Cyan
    Write-Host "   http://192.168.1.103:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "🔄 Ahora intenta conectar desde tu celular" -ForegroundColor Yellow
    Write-Host ""
    
} catch {
    Write-Host "❌ Error al crear la regla de firewall" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Alternativa: Desactiva temporalmente el firewall" -ForegroundColor Yellow
    Write-Host "   1. Ve a Configuración de Windows" -ForegroundColor White
    Write-Host "   2. Busca 'Firewall de Windows Defender'" -ForegroundColor White
    Write-Host "   3. Desactívalo temporalmente" -ForegroundColor White
    Write-Host ""
}

pause
