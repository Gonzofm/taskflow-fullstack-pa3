# Auditoría de TaskFlow PA4

Revisión local del 23 de noviembre de 2026. Los resultados siguientes corresponden a MariaDB real y a la rama `pa4-desarrollo`. La publicación de AlwaysData y Netlify está comprobada mediante HTTP y navegador. La sustentación se evalúa por separado.

## Rúbrica

| Criterio | Máximo | Estimación | Evidencia |
| --- | ---: | ---: | --- |
| Diseño según proyecto y plantilla | 2 | 2 | Open Sans, paleta, tarjetas, bordes e imágenes revisadas |
| Primera tabla con imágenes | 1 | 1 | Seis integrantes, seis columnas e imágenes HTTPS |
| Tablas maestro-detalle | 2 | 2 | Tres categorías, doce plantillas y clave foránea activa |
| Servicios web | 2 | 2 | Cinco servicios de catálogo públicos con SQL real |
| Primera página del menú | 2 | 2 | Equipo carga seis perfiles desde AlwaysData |
| Segunda página maestro-detalle | 3 | 3 | Selección de categoría, cuatro detalles y navegación |
| Página 404 | 1 | 1 | Ruta inválida, recarga y regreso al inicio en Netlify |
| Entregables | 3 | 3 | Tres enlaces públicos verificados |
| Subtotal técnico | 16 | 16 | Estimación sujeta a la revisión del docente |
| Sustentación | 4 | Pendiente | Requiere las respuestas personales del estudiante |

La estimación técnica es **16/16**. Los cuatro puntos de sustentación sólo pueden acreditarse con la intervención del estudiante; preparar una guía no equivale a obtenerlos. El total de 20 requiere responder correctamente durante la evaluación.

La estructura coincide con las convenciones observadas en los PPT. Los proyectos originales de empleados y tienda no se proporcionaron; la equivalencia exacta debe cotejarse si están disponibles. El alcance de esa comparación consta en [REQUISITOS_PA4.md](REQUISITOS_PA4.md).

## Base de datos y servicios

[schema.sql](../database/schema.sql) define cinco tablas InnoDB. Las tres del catálogo son `integrantes`, `categorias` y `plantillas`. Las tablas `users` y `tasks` permiten conservar el registro, inicio de sesión y gestión de tareas sin depender de MongoDB en PA4.

[seed.sql](../database/seed.sql) contiene seis perfiles de demostración, tres categorías y doce plantillas. Las imágenes se almacenan como rutas. La clave `plantillas.categoria_id` referencia `categorias.id`, y la base impide insertar un detalle sin su maestro. Reimportar el seed no duplica registros ni sobrescribe sus datos.

| Ruta | Resultado público comprobado |
|---|---|
| `GET /api/health` | JSON 200 con conexión SQL activa |
| `GET /api/integrantes` | Seis registros |
| `GET /api/categorias` | Tres registros y conteo de plantillas |
| `GET /api/plantillas` | Doce registros |
| `GET /api/plantillas/categoria/:id` | Cuatro registros relacionados para cada categoría |
| `GET /api/plantillas/:id` | Detalle coincidente con su registro y categoría |

Las 21 rutas de imagen del catálogo devolvieron HTTP 200 con el tipo de contenido correspondiente. La carga y la proporción visual se comprobaron además desde el sitio de Netlify. [Resultados públicos](evidencias/pa4/publicacion.json).

## Pruebas ejecutadas

`npm run typecheck --workspace @taskflow/server` terminó con código 0. `npm test --workspace @taskflow/server` ejecutó **18 pruebas aprobadas** contra una base independiente `taskflow_pa4_test`, sin sustituir consultas SQL por respuestas simuladas. La configuración se encuentra en [vitest.pa4.config.ts](../server/vitest.pa4.config.ts) y los casos en [pa4.test.ts](../server/tests/pa4.test.ts).

Se comprobaron conexión y cabeceras, cantidades y relaciones, detalle, clave foránea, reimportación del seed, imágenes, identificadores inválidos e intentos de inyección, CORS, registro con bcrypt, JWT, validación y duplicados, inicio de sesión, rutas privadas, creación y consulta de tareas, validación de propietario, aislamiento entre cuentas, conservación al reabrir el pool y eliminación de una tarea propia.

La prueba de conservación SQL cierra y reabre las conexiones de la aplicación. No se presenta como un reinicio del proceso MariaDB. Las pruebas anteriores de MongoDB pertenecen al PA3 y tienen una configuración separada.

Se detectó y corrigió una diferencia de cinco horas al interpretar `DATETIME` de un servidor con zona local. Los modelos escriben las fechas de usuarios y tareas mediante `UTC_TIMESTAMP(3)` y el controlador SQL las interpreta en UTC. Las pruebas comparan las fechas de creación y actualización con el reloj real.

## Seguridad revisada

Las consultas de catálogo y tareas usan parámetros `?`. Las partes estructurales de SQL son constantes de la aplicación. Los identificadores de catálogo se validan como enteros positivos; los de tareas son UUID. El propietario procede del JWT verificado y forma parte de las condiciones de consulta, actualización y eliminación.

Las contraseñas se almacenan mediante bcrypt y nunca forman parte del usuario público. Los tokens usan HS256, emisor, audiencia y caducidad. La configuración exige un secreto de al menos 32 bytes, valida los orígenes y requiere HTTPS para las URLs públicas en producción. Los errores no incluyen consultas, trazas ni credenciales.

El pool limita las conexiones a cinco y desactiva sentencias múltiples. El middleware CORS permite el origen exacto del frontend. Los archivos públicos se limitan a la carpeta de imágenes. Las variables privadas permanecen fuera de la documentación y del código fuente. El escaneo de archivos publicables y la revisión de comentarios están registrados en [seguridad.json](evidencias/pa4/seguridad.json) y [comentarios.json](evidencias/pa4/comentarios.json). No se detectaron secretos publicados ni comentarios propios.

## Publicación comprobada

AlwaysData necesita un sitio de tipo Node.js con la IP o el host y el puerto asignados por su panel. No debe reutilizarse `127.0.0.1:4000` del entorno local. La entrada de TaskFlow admite `HOST`, `IP` y `PORT`; las variables de entorno del hosting prevalecen sobre el archivo local. El comando de producción de esta rama ejecuta `server/dist/pa4/index.js`. [Configuración oficial de Node.js](https://help.alwaysdata.com/en/docs/web-hosting/languages/nodejs/configuration/).

El host MySQL, el usuario y el nombre de base se toman del panel de la cuenta; el puerto habitual es 3306. Los scripts SQL se importan dentro de esa base mediante phpMyAdmin y no crean ni eliminan bases ajenas. El límite del pool de TaskFlow queda por debajo de las 40 conexiones simultáneas por usuario indicadas para Public Cloud. [Documentación oficial de MariaDB](https://help.alwaysdata.com/en/docs/web-hosting/databases/mariadb/).

Netlify compila el cliente con `VITE_API_URL` apuntando a la URL HTTPS de AlwaysData y publicar `client/dist`. La redirección a `index.html` permite resolver las rutas de React al recargar. La página 404, la recarga de rutas, la navegación, el consumo de API, CORS, imágenes y ausencia de dependencias de localhost se comprobaron desde el dominio final.

La referencia de diseño es [Mytask en ThemeForest](https://themeforest.net/item/mytask-react-redux-project-management-admin-template/35386552). GitHub es un respaldo del código y no sustituye ninguno de los dos enlaces de hosting.

## Comprobaciones finales

La base de AlwaysData contiene seis integrantes, tres categorías y doce plantillas. Una consulta SQL con TLS verificó cuatro plantillas por categoría y la clave foránea. Se rechazó un detalle huérfano y se revirtió la transacción de prueba. [Verificación remota](evidencias/pa4/mysql-alwaysdata.json).

La API pública aprobó registro, login, perfil, creación, edición, consulta y eliminación de una tarea temporal. El recorrido de navegador aprobó equipo, categorías, detalle, recarga, menú móvil de 320 píxeles, login, creación y eliminación por UI, cierre de sesión y 404. No se observaron errores ni advertencias de consola. [API pública](evidencias/pa4/autenticacion-publica.json), [navegador](evidencias/pa4/navegador-publico.json).

La suite MongoDB conservada volvió a aprobar **18/18 pruebas**, incluida la prueba original que reinicia mongod. La rama main permanece en 40b6872. [Regresión PA3](evidencias/pa4/regresion-pa3.txt).

El nuevo servicio de AlwaysData atiende /api y /images y conserva el sitio PHP existente. Las credenciales se cargan desde el archivo privado del servidor. Netlify publica desde pa4-desarrollo con la API HTTPS configurada. Los únicos enlaces de entrega están en [ENTREGA_PA4.md](ENTREGA_PA4.md).

Queda practicar las treinta respuestas de [SUSTENTACION_PA4.md](SUSTENTACION_PA4.md) y cotejar la estructura con los proyectos originales del docente si se proporcionan.
