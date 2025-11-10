# Configuración de VS Code para Tailwind CSS

Los warnings de `@tailwind` y `@apply` son normales en proyectos con Tailwind CSS. Para eliminarlos:

## Opción 1: Configuración de VS Code (Recomendado)

1. Abre VS Code
2. Presiona `Ctrl + ,` para abrir Settings
3. Busca "css.lint.unknownAtRules"
4. Cambia el valor a "ignore"

O también puedes:

1. Presiona `Ctrl + Shift + P`
2. Escribe "Preferences: Open Settings (JSON)"
3. Agrega esta línea:

```json
{
  "css.lint.unknownAtRules": "ignore"
}
```

## Opción 2: Instalar extensión Tailwind CSS IntelliSense

1. Ve a Extensions (`Ctrl + Shift + X`)
2. Busca "Tailwind CSS IntelliSense"
3. Instala la extensión de Brad Cornes
4. Reinicia VS Code

Esta extensión además te dará autocompletado y preview de las clases de Tailwind.

## Opción 3: Crear archivo .vscode/settings.json local

Si prefieres que la configuración sea solo para este proyecto:

1. Crea una carpeta `.vscode` en la raíz del proyecto
2. Dentro crea un archivo `settings.json` con:

```json
{
  "css.lint.unknownAtRules": "ignore",
  "css.validate": false,
  "tailwindCSS.emmetCompletions": true
}
```

**Nota:** El archivo `.vscode/settings.json` está en `.gitignore` para no compartir configuraciones personales del editor.

## ¿Por qué aparecen estos warnings?

- `@tailwind` y `@apply` son directivas específicas de Tailwind CSS
- El linter de CSS estándar no las reconoce
- **No afectan el funcionamiento** del proyecto
- Son procesadas correctamente por PostCSS durante el build

## Verificación

Después de aplicar cualquiera de estas opciones:
1. Cierra y vuelve a abrir el archivo `index.css`
2. Los warnings deberían desaparecer
