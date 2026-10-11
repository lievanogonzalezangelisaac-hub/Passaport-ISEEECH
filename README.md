# Pasaporte de Aventuras y Sellos Digitales 🛂✨

Una aplicación web interactiva y segura construida en React + TypeScript que simula un auténtico pasaporte de exploración en formato libro 3D, con emisión y escaneo de sellos digitales mediante códigos QR entre el Guía y el Viajante.

---

## 🔒 Aspectos de Seguridad y Privacidad

Esta aplicación fue auditada y blindada de extremo a extremo para garantizar la máxima seguridad tanto del autor como de los usuarios al publicarse en GitHub:

- **100% Privacidad Local (Sin fuga de datos):** Toda la información de identificación del viajante y los sellos se almacenan de manera local y aislada en el dispositivo del usuario (`localStorage`). No se envían datos sensibles a servidores externos ni redes de telemetría.
- **Protección contra Inyección de Scripts (XSS) y SVG Maliciosos:** La subida de imágenes QR valida estrictamente formatos rasterizados seguros (`PNG`, `JPEG`, `WebP`) y rechaza archivos vectoriales `SVG` o `XML` que podrían contener código ejecutable.
- **Defensa contra Prototype Pollution:** Toda decodificación de códigos QR y lectura de almacenamiento valida rigurosamente los esquemas y descarta propiedades no permitidas (`__proto__`, `constructor`, `prototype`).
- **Control de Acceso a Dispositivos:** La cámara solo se activa tras autorización explícita del usuario y todos los canales de captura (`MediaStream`) se liberan de inmediato al cerrar el escáner para evitar uso indebido o consumo de batería.
- **Content Security Policy (CSP) Estricta:** Política de seguridad restrictiva en `index.html` que bloquea iframes externos, balizas de rastreo y ejecución de objetos no autorizados.
- **Preparado para GitHub (.gitignore endurecido):** Protección automática contra subida accidental de credenciales, claves privadas (`*.pem`, `*.key`), archivos de entorno `.env*`, historiales de depuración y archivos temporales del sistema operativo.

---

## 🚀 Características Principales

1. **Modo Viajante (Traveler View - En Inglés):**
   - Hoja de identificación y biodatos conforme a la estética internacional ICAO 9303.
   - Navegación realista de páginas en formato libro 3D y vista móvil a pantalla completa.
   - Páginas de visados con sellos consulares interactivos de diversas geometrías y tintas de agua.
   - Exportación del pasaporte completo en alta resolución (JPG).
   - Escaneo de códigos QR mediante cámara en vivo, subida de foto o simulador guiado.

2. **Modo Guía (Guide Portal - En Español):**
   - 4 plantillas oficiales listas para uso en actividades culturales y gastronómicas.
   - Generación instantánea de códigos QR vectoriales con código de verificación anti-manipulación.
   - Posibilidad de proyectar el código QR en pantalla completa o descargar la imagen PNG para imprimir.
   - Opción de sellar directamente en el pasaporte en un solo clic.

---

## 🛠️ Instalación y Ejecución Local

### Prerrequisitos
- Node.js (v18 o superior)
- npm o bun

### Pasos

1. Clonar el repositorio:
```bash
git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
cd TU_REPOSITORIO
```

2. Instalar dependencias:
```bash
npm install
```

3. Iniciar el entorno de desarrollo:
```bash
npm run dev
```

4. Abrir en el navegador:
```
http://localhost:3000
```

5. Compilar para producción:
```bash
npm run build
```

---

## 📂 Estructura del Código

```
├── .gitignore               # Reglas exhaustivas de exclusión y protección de secretos
├── SECURITY.md              # Política de seguridad y modelo de amenazas
├── index.html               # Entry point con cabeceras de seguridad CSP y Permissions-Policy
├── package.json             # Dependencias del proyecto y scripts
├── src/
│   ├── App.tsx              # Componente principal con sincronización segura de estado
│   ├── types.ts             # Tipos e interfaces de TypeScript
│   ├── components/
│   │   ├── PassportBook.tsx          # Libro interactivo 3D con cambio de páginas
│   │   ├── IdentityPage.tsx          # Hoja de biodatos del viajante
│   │   ├── PassportPageSpread.tsx    # Hojas de visados y cuadrícula de sellos
│   │   ├── DigitalStamp.tsx          # Renderizado de sellos consulares estilizados
│   │   ├── GuidePortal.tsx           # Portal del guía para emisión y QR
│   │   ├── QRScannerModal.tsx        # Escáner con validación estricta y bloqueo de SVG
│   │   ├── EditTravelerModal.tsx     # Formulario de datos personales con saneamiento
│   │   ├── StampDetailModal.tsx      # Inspección detallada del certificado consular
│   │   └── Header.tsx                # Barra superior con cambio de rol y controles
│   └── utils/
│       ├── security.ts      # Suite de saneamiento, validación y almacenamiento seguro
│       ├── sampleData.ts    # Datos iniciales y plantillas
│       ├── audio.ts         # Sintetizador Web Audio para sonidos realistas
│       └── passportExport.ts # Generador canvas para exportar el pasaporte a JPG
```

---

## 📄 Licencia

Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.
