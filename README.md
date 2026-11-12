# Calford Cargo Compass

Crea un prototipo interactivo para el portal extranet web y móvil de "Calford Import" (empresa de logística de importación Miami-Lima). Usa una paleta de colores azul corporativo, blanco y detalles en naranja/verde.

Estructura de la App:

1. Navegación Principal: Sidebar retráctil en Web y Bottom Navigation Bar en Móvil con las secciones:

   - Inicio (Dashboard)

   - Mis Embarques

   - Seguimiento

   - Programar Delivery

   - Club Calford (Beneficios)

2. Pantalla 1: Dashboard de Bienvenida

   - Saludo al usuario.

   - Tarjeta destacada "Club Calford": Muestra 350 puntos acumulados y una barra de progreso que indica "¡Te faltan 150 pts para tu próximo envío gratis!".

   - Botón principal de acción: "+ Registrar Nuevo Embarque".

   - Tarjetas de resumen rápido: Embarques En Tránsito (2), En Almacén Miami (1), Entregados (5).

3. Pantalla 2: Wizard / Formulario por pasos "Nuevo Embarque"

   - Paso 1 (Pre-Guía): Muestra número de Pre-Guía autogenerado (ej: PG-2026-0089) y selector del usuario comprador.

   - Paso 2 (Órdenes y Trackings): Permitir agregar Órdenes. Cada Orden tiene: Tienda (dropdown: Amazon, eBay, etc.), Resumen del contenido (texto) y Valor USD Total de la orden. Dentro de cada Orden, poder agregar múltiples números de Tracking.

   - Paso 3 (Importador): Campo para ingresar DNI o RUC. Si no existe, mostrar un modal/alerta que pida registrar sus datos básicos.

   - Paso 4 (Resumen): Vista limpia tipo ticket de confirmación con botón "Enviar Embarque a Miami".

Haz la interfaz muy limpia, intuitiva y amigable (UX/UI profesional de nivel comercial).

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b2c0ae6c-e24c-41a7-82d0-f90d4ea2f062).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
