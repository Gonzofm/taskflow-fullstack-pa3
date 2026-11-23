# Requisitos del PA4 y fuentes del curso

TaskFlow continúa como aplicación de productividad. La adaptación incorpora un equipo y una biblioteca de plantillas consultados desde MySQL/MariaDB, sin reemplazar la versión PA3 de `main`.

Este documento registra lo que exige la evaluación y las convenciones que aparecen en el material proporcionado. Los resultados de pruebas y los enlaces de despliegue deben comprobarse por separado; esta lectura de requisitos no acredita una publicación.

## Fuentes académicas utilizadas

Se revisaron exclusivamente estos seis archivos como material académico:

- `PA4 - Programación Web Avanzada - 4059.docx`.
- `30690-S05-PPT.pptx`.
- `30690-S06-PPT.pptx`.
- `30690-S07-PPT.pptx`.
- `30690-S09-PPT.pptx`.
- `30690-S10-PPT.pptx`.

Las referencias P corresponden al orden de párrafos del cuerpo y las tablas del DOCX, incluidos los párrafos vacíos. Las referencias a diapositivas corresponden a su posición en cada PPTX. Se leyeron los archivos originales disponibles en Descargas; no se incluyen copias en el repositorio.

## Requisitos de la evaluación

| Referencia del DOCX | Exigencia | Aplicación a TaskFlow |
|---|---|---|
| P18 | Node.js, MySQL/MariaDB, JSON, React y Tailwind CSS | API SQL y cliente React con Tailwind |
| P20 | Estructura como la desarrollada en clase | Carpetas sencillas de configuración, modelos, controladores, rutas y middleware; cotejo pendiente con los ejemplos originales |
| P23–26 | Continuar el proyecto y seguir una plantilla ThemeForest | Mantener TaskFlow y adaptar el diseño según Mytask |
| P25 | Ausencia de comentarios y anotaciones en el código | Revisar JS, TS, JSX, TSX, CSS, HTML y SQL propios antes de entregar |
| P28 | Una tabla con imágenes, al menos 6 filas y 4 columnas | `integrantes`, con nombre, cargo, descripción, imagen y especialidad |
| P29 | Dos tablas relacionadas, 3 maestros y 4 detalles por maestro como mínimo; imagen en detalle | `categorias` y `plantillas`, enlazadas mediante `categoria_id` |
| P30 | Servicios web correspondientes | Consultas SQL reales expuestas por Express |
| P32–34 | Dos opciones de menú y páginas que consuman las tablas | Nuestro equipo y Plantillas con selección de categoría |
| P35 | Página 404 | Vista propia y enlace de regreso al inicio |
| P37–40 | Entregar únicamente tres enlaces | Backend AlwaysData, plantilla ThemeForest y frontend Netlify |
| P43 | Ambos servicios publicados antes de sustentar | Verificar URLs HTTPS y consumo de API desde Netlify |
| P44–47 | Proyectos abiertos en VS Code y base en phpMyAdmin; dos preguntas de unos 20 segundos | Preparación en [SUSTENTACION_PA4.md](SUSTENTACION_PA4.md) |
| P50 | Sustentar también el código generado con IA | Comprender los archivos y funciones reales, sin memorizar respuestas ajenas al código |

La mención general a subir archivos de P13 no sustituye la instrucción específica P37–40. La entrega solicitada consiste en los tres enlaces, sin Word, PDF, ZIP ni carpetas. GitHub sirve de respaldo y no reemplaza ninguno de los hosting.

## Estructura observada en los PPT

### Backend

S05, diapositivas 10–12, presenta un servidor con `app.js`, Express y scripts npm. La diapositiva 19 introduce `express.Router()` y una carpeta `routes`. Las diapositivas 21–25 explican middleware, procesamiento JSON y manejo de errores.

S06, diapositiva 17, muestra expresamente esta organización:

```text
config/database.js
models/Usuario.js
controllers/usuarioController.js
routes/usuarioRoutes.js
middlewares/validarCampos.js
server.js
.env
package.json
```

Las diapositivas 18–22 desarrollan la separación de responsabilidades. La diapositiva 31 recomienda mantener rutas, controladores y modelos separados. TaskFlow conserva estas responsabilidades dentro de `server/src/pa4/`, usando TypeScript y `index.ts` como entrada.

S06 enseña MongoDB/Mongoose. Sin embargo, P18 del enunciado exige MySQL/MariaDB para esta evaluación. Los nuevos modelos ejecutan SQL parametrizado; MongoDB y el código anterior quedan conservados para PA3.

S07, diapositivas 8–9 y 22, desarrolla JWT y protección de rutas; 13–14, CORS y orígenes permitidos; 17–18, hash y comparación bcrypt. TaskFlow conserva autenticación y tareas privadas, mientras las páginas de equipo y catálogo son públicas.

### Frontend

S09, diapositivas 13–18, presenta componentes funcionales y props; 23–25, `useState`, `useEffect` y llamadas a API. Las diapositivas 28–31 muestran `BrowserRouter` en `main.jsx`, `Routes` y `Route` en `App`, páginas en `pages`, navegación con `Link` y parámetros con `useParams`.

S10, diapositivas 16–22, explica el contexto, el provider y el consumidor con `useContext`, y recomienda separar providers. Las diapositivas 24–30 introducen Redux, sin establecer que deba incorporarse a esta evaluación. TaskFlow utiliza su contexto de autenticación existente.

### Límite de la comparación con clase

No se proporcionaron los proyectos originales de empleados y tienda mencionados en P28, P29 y P34. Los PPT permiten comprobar las convenciones anteriores, pero no la equivalencia exacta con esos ejemplos. Es necesario comparar el proyecto con los archivos del docente si se dispone de ellos, especialmente por la condición de P20. No se afirma que esa comparación ya esté aprobada.

Los comentarios utilizados para explicar ejemplos en los PPT no autorizan comentarios en el código entregado. Prevalece la prohibición explícita del enunciado.

## Decisiones concretas solicitadas para TaskFlow

La solicitud del proyecto concreta los mínimos de la evaluación mediante seis integrantes, tres categorías y doce plantillas, además de cinco endpoints GET de catálogo. También exige claves foráneas, scripts SQL importables, consultas de comprobación, pruebas reales y conservación del PA3. Estos nombres y rutas proceden de la solicitud del usuario; el DOCX exige las funciones y cantidades, sin imponer esos identificadores.

El esquema conserva adicionalmente usuarios y tareas en SQL para mantener las funciones de productividad en PA4. La versión previa se preserva en `main`; el desarrollo nuevo se realiza en `pa4-desarrollo`.

## Rúbrica y penalizaciones

| Criterio | Máximo |
|---|---:|
| Diseño conforme al proyecto y plantilla | 2 |
| Primera tabla con imágenes | 1 |
| Tablas maestro-detalle | 2 |
| Servicios web | 2 |
| Primera página del menú | 2 |
| Segunda página maestro-detalle | 3 |
| Página 404 | 1 |
| Tres enlaces de entrega | 3 |
| Subtotal técnico y entrega | 16 |
| Sustentación personal | 4 |
| Total | 20 |

P52–66 establece descuentos de un punto por infracción de tratamiento de imágenes, fuentes, paleta, bordes y efectos visuales. Además, se descuenta un punto por cada comentario encontrado en el código. La revisión debe comprobar imágenes sin deformación, fuente y colores observados en Mytask, esquinas, sombras y transiciones, así como el código propio sin comentarios.

Los cuatro puntos de sustentación requieren respuestas personales y no se consideran obtenidos por preparar una guía. La puntuación técnica tampoco debe tratarse como definitiva antes de verificar servicios públicos, datos, navegación y diseño.

## Evidencia que debe comprobarse antes de entregar

- Consultas reales que acrediten seis integrantes, tres categorías y al menos cuatro plantillas por categoría, con imágenes accesibles y clave foránea activa.
- Respuestas JSON de los endpoints publicados en AlwaysData y ausencia de credenciales en respuestas y archivos públicos.
- Páginas de equipo, categorías y detalle consumiendo esa API desde Netlify; revisión responsive, imágenes, CORS y consola.
- Recarga directa de rutas válidas y visualización de la página 404 en una ruta inexistente de Netlify.
- Auditoría de comentarios del código propio, build correcto y correspondencia entre el diseño y la referencia inspeccionada.
- Tres enlaces definitivos comprobados desde Internet y preparación personal para la sustentación.

La documentación técnica de proveedores puede consultarse para instalación y despliegue. Debe distinguirse de las seis fuentes académicas anteriores.
