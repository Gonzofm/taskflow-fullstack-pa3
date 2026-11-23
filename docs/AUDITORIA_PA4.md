# Auditoría de TaskFlow PA4

Revisión local del 23 de noviembre de 2026. Los resultados siguientes corresponden a MariaDB real y a la rama `pa4-desarrollo`. La publicación de AlwaysData y Netlify todavía requiere autenticación y verificación pública. La sustentación se evalúa por separado.

## Rúbrica

| Criterio | Máximo | Estado comprobado |
|---|---:|---|
| Diseño según proyecto y plantilla | 2 | Referencia Mytask identificada; comparación visual final pendiente |
| Primera tabla con imágenes | 1 | Seis integrantes, seis columnas y seis fotografías accesibles en la API local |
| Tablas maestro-detalle | 2 | Tres categorías, doce plantillas, cuatro por categoría y clave foránea activa |
| Servicios web | 2 | Cinco servicios de catálogo y funciones privadas probados contra MariaDB local; verificación pública pendiente |
| Primera página del menú | 2 | Página Nuestro equipo implementada; comprobación visual en navegador pendiente |
| Segunda página maestro-detalle | 3 | Catálogo, selección de categoría y detalle implementados; recorrido de navegador pendiente |
| Página 404 | 1 | Ruta personalizada implementada; acceso directo y recarga en Netlify pendientes |
| Entregables | 3 | Pendientes URLs funcionales de AlwaysData y Netlify; URL de ThemeForest identificada |
| Sustentación | 4 | Guía preparada; respuestas personales ante el docente pendientes |

La implementación local puede cubrir hasta **13 de los 16 puntos técnicos**, cuando se cierren las verificaciones visuales y de navegación. Los tres puntos de entregables dependen de la publicación real. No se asigna automáticamente 16/16 ni 20/20. Los cuatro puntos de sustentación sólo pueden acreditarse con la intervención del estudiante.

La condición de estructura del docente debe contrastarse con los proyectos originales de empleados y tienda cuando estén disponibles. La separación actual de rutas, controladores, modelos, configuración y middleware coincide con las convenciones observadas en los PPT. El alcance exacto de esa comparación consta en [REQUISITOS_PA4.md](REQUISITOS_PA4.md).

## Base de datos y servicios

[schema.sql](../database/schema.sql) define cinco tablas InnoDB. Las tres del catálogo son `integrantes`, `categorias` y `plantillas`. Las tablas `users` y `tasks` permiten conservar el registro, inicio de sesión y gestión de tareas sin depender de MongoDB en PA4.

[seed.sql](../database/seed.sql) contiene seis perfiles de demostración, tres categorías y doce plantillas. Las imágenes se almacenan como rutas. La clave `plantillas.categoria_id` referencia `categorias.id`, y la base impide insertar un detalle sin su maestro. Reimportar el seed no duplica registros ni sobrescribe sus datos.

| Ruta | Resultado local comprobado |
|---|---|
| `GET /api/health` | JSON 200 con conexión SQL activa |
| `GET /api/integrantes` | Seis registros |
| `GET /api/categorias` | Tres registros y conteo de plantillas |
| `GET /api/plantillas` | Doce registros |
| `GET /api/plantillas/categoria/:id` | Cuatro registros relacionados para cada categoría |
| `GET /api/plantillas/:id` | Detalle coincidente con su registro y categoría |

Las 21 rutas de imagen del catálogo devolvieron HTTP 200 con el tipo de contenido correspondiente. Esto demuestra disponibilidad de los archivos locales; la proporción visual y la carga desde el dominio público se revisan por separado.

## Pruebas ejecutadas

`npm run typecheck --workspace @taskflow/server` terminó con código 0. `npm test --workspace @taskflow/server` ejecutó **18 pruebas aprobadas** contra una base independiente `taskflow_pa4_test`, sin sustituir consultas SQL por respuestas simuladas. La configuración se encuentra en [vitest.pa4.config.ts](../server/vitest.pa4.config.ts) y los casos en [pa4.test.ts](../server/tests/pa4.test.ts).

Se comprobaron conexión y cabeceras, cantidades y relaciones, detalle, clave foránea, reimportación del seed, imágenes, identificadores inválidos e intentos de inyección, CORS, registro con bcrypt, JWT, validación y duplicados, inicio de sesión, rutas privadas, creación y consulta de tareas, validación de propietario, aislamiento entre cuentas, conservación al reabrir el pool y eliminación de una tarea propia.

La prueba de conservación SQL cierra y reabre las conexiones de la aplicación. No se presenta como un reinicio del proceso MariaDB. Las pruebas anteriores de MongoDB pertenecen al PA3 y tienen una configuración separada.

Se detectó y corrigió una diferencia de cinco horas al interpretar `DATETIME` de un servidor con zona local. Los modelos escriben las fechas de usuarios y tareas mediante `UTC_TIMESTAMP(3)` y el controlador SQL las interpreta en UTC. Las pruebas comparan las fechas de creación y actualización con el reloj real.

## Seguridad revisada

Las consultas de catálogo y tareas usan parámetros `?`. Las partes estructurales de SQL son constantes de la aplicación. Los identificadores de catálogo se validan como enteros positivos; los de tareas son UUID. El propietario procede del JWT verificado y forma parte de las condiciones de consulta, actualización y eliminación.

Las contraseñas se almacenan mediante bcrypt y nunca forman parte del usuario público. Los tokens usan HS256, emisor, audiencia y caducidad. La configuración exige un secreto de al menos 32 bytes, valida los orígenes y requiere HTTPS para las URLs públicas en producción. Los errores no incluyen consultas, trazas ni credenciales.

El pool limita las conexiones a cinco y desactiva sentencias múltiples. El middleware CORS permite el origen exacto del frontend. Los archivos públicos se limitan a la carpeta de imágenes. Las variables privadas permanecen fuera de la documentación y del código fuente. El escaneo completo de Git y la revisión final de comentarios quedan pendientes de su ejecución al cierre.

## Condiciones de publicación

AlwaysData necesita un sitio de tipo Node.js con la IP o el host y el puerto asignados por su panel. No debe reutilizarse `127.0.0.1:4000` del entorno local. La entrada de TaskFlow admite `HOST`, `IP` y `PORT`; las variables de entorno del hosting prevalecen sobre el archivo local. El comando de producción de esta rama ejecuta `server/dist/pa4/index.js`. [Configuración oficial de Node.js](https://help.alwaysdata.com/en/docs/web-hosting/languages/nodejs/configuration/).

El host MySQL, el usuario y el nombre de base se toman del panel de la cuenta; el puerto habitual es 3306. Los scripts SQL se importan dentro de esa base mediante phpMyAdmin y no crean ni eliminan bases ajenas. El límite del pool de TaskFlow queda por debajo de las 40 conexiones simultáneas por usuario indicadas para Public Cloud. [Documentación oficial de MariaDB](https://help.alwaysdata.com/en/docs/web-hosting/databases/mariadb/).

Netlify debe compilar el cliente con `VITE_API_URL` apuntando a la URL HTTPS de AlwaysData y publicar `client/dist`. La redirección a `index.html` permite resolver las rutas de React al recargar. La página personalizada 404 necesita comprobarse desde el dominio final, al igual que el consumo de API, CORS, imágenes y ausencia de dependencias de localhost.

La referencia de diseño es [Mytask en ThemeForest](https://themeforest.net/item/mytask-react-redux-project-management-admin-template/35386552). GitHub es un respaldo del código y no sustituye ninguno de los dos enlaces de hosting.

## Pendientes de cierre

- Verificar visualmente equipo, categorías, detalle, tareas y página 404 en escritorio y móvil.
- Completar autenticación y despliegue de la base y API en AlwaysData.
- Publicar Netlify con la API pública y verificar navegación, recarga, imágenes y consola.
- Ejecutar y registrar el escaneo final de comentarios y secretos sobre los archivos entregados.
- Cotejar con los ejemplos originales del docente si se obtienen.
- Practicar las respuestas de [SUSTENTACION_PA4.md](SUSTENTACION_PA4.md).
