# Portafolio (Frontend UI) — Cristhian Huamaní

Frontend de mi portafolio personal, desarrollado con **Astro**, **Tailwind CSS** y animaciones con **GSAP**.

Este repositorio contiene exclusivamente la interfaz de usuario (UI). Está integrado mediante API con **Strapi** como Headless CMS, lo que me permite crear, actualizar o modificar secciones, proyectos y datos de manera dinámica desde su panel de administración, sin tener que tocar el código ni hacer nuevos despliegues cada vez que hay cambios.

---

## Sobre mí

Soy **Cristhian Huamaní**, desarrollador frontend de Perú 🇵🇪.

Me dedico a diseñar y construir landing pages modernas pensadas para pequeños negocios y emprendedores. Mi objetivo es unir diseño limpio, animaciones sutiles y buen rendimiento para crear sitios que transmitan confianza, carguen rápido y ayuden a convertir visitas en clientes reales.

- **Stack principal:** Astro, React, Tailwind CSS y GSAP.
- **Enfoque:** Cuidar la experiencia del usuario (UX), fluidez en las transiciones, jerarquía visual y tipografías.
- **Mentalidad:** Aunque soy desarrollador junior, tengo claro lo que busco: aprender rápido, ser constante, entregar código ordenado y mejorar el nivel visual y técnico en cada proyecto que desarrollo.

---

## Tecnologías y Arquitectura

- **Framework UI:** [Astro](https://astro.build/) (sitio rápido, mínimo JavaScript innecesario)
- **Estilos:** [Tailwind CSS](https://tailwindcss.com/) (diseño responsivo y utilidades modernas)
- **Animaciones:** [GSAP](https://gsap.com/) (interacciones, transiciones fluidas y microanimaciones de tarjetas)
- **CMS / Contenido:** [Strapi](https://strapi.io/) (Headless CMS consumido por API para gestionar el contenido dinámicamente)

### Conexión con Strapi
La interfaz consulta los endpoints de Strapi vía API para obtener la información de proyectos, servicios y descripciones. Esto mantiene el frontend desacoplado del contenido: si necesito añadir un nuevo proyecto o ajustar un texto, simplemente lo actualizo desde Strapi y se refleja en el sitio.

---

## Instalación y uso local

1. **Clonar el proyecto:**
   ```bash
   git clone https://github.com/cris2154/PortafolioV3.git
   cd PortafolioV3
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Variables de entorno (opcional / según entorno Strapi):**
   Crea un archivo `.env` en la raíz si tu configuración requiere la URL de tu backend:
   ```env
   PUBLIC_STRAPI_URL=http://localhost:1337
   ```

4. **Correr en modo desarrollo:**
   ```bash
   npm run dev
   ```
   El sitio estará disponible en `http://localhost:4321`.

5. **Compilar para producción:**
   ```bash
   npm run build
   ```
   Los archivos estáticos/optimizados se generarán en la carpeta `dist/`.

---

## Contacto

- **LinkedIn:** [Cristhian Huamaní](https://www.linkedin.com/in/crithianhuamani/)
- **Correo:** [Crishuamani023@gmail.com](mailto:Crishuamani023@gmail.com)
- **WhatsApp:** [+51 921 554 150](https://wa.me/51921554150)
- **Twitter / X:** [@CrisDev23](https://x.com/CrisDev23)
- **Instagram:** [@hyrix01](https://www.instagram.com/hyrix01/)
- **YouTube:** [@criscode-31](https://www.youtube.com/@criscode-31)
