# Sustentación de TaskFlow PA4

Esta guía permite explicar la aplicación usando sus archivos reales. Practica cada respuesta en voz alta y abre la función indicada antes de sustentar. Las respuestas son breves para ajustarse a unos veinte segundos; debes comprenderlas y adaptarlas a tus palabras.

La evaluación contempla dos preguntas del frontend o backend y cuatro puntos de sustentación. La preparación de este documento no acredita esos puntos. El docente exige que el backend y el frontend estén publicados antes de la exposición.

## Arquitectura de la aplicación

El navegador ejecuta React y solicita información JSON a la API Express. El backend consulta MySQL/MariaDB y devuelve los integrantes, categorías y plantillas. Al seleccionar una categoría se consulta únicamente su detalle relacionado. El cliente nunca recibe las credenciales de la base de datos.

Las páginas Nuestro equipo y Plantillas son públicas. El registro, inicio de sesión y gestor personal de tareas conservan JWT y bcrypt, con usuarios y tareas almacenados en SQL para PA4. La versión MongoDB del PA3 sigue conservada en `main` y sus archivos de backend permanecen fuera de `src/pa4`.

| Ruta | Responsabilidad |
|---|---|
| `client/src/main.tsx` | Monta React, BrowserRouter y los providers |
| `client/src/App.tsx` | Declara las rutas del cliente |
| `client/src/pages/` | Equipo, biblioteca, detalle, 404, autenticación y tareas |
| `client/src/components/` | Navegación, diseño compartido, tarjetas y estados de carga |
| `client/src/hooks/useCatalog.ts` | Carga datos y controla carga, error y reintento |
| `client/src/services/catalog.ts` | Realiza las peticiones HTTP del catálogo |
| `client/src/context/AuthContext.tsx` | Comparte usuario y operaciones de sesión |
| `server/src/pa4/index.ts` | Lee configuración, comprueba SQL e inicia la API |
| `server/src/pa4/config/` | Valida variables y crea el pool SQL |
| `server/src/pa4/routes/` | Asocia métodos y URLs con controladores |
| `server/src/pa4/controllers/` | Valida solicitudes y prepara respuestas |
| `server/src/pa4/models/` | Ejecuta consultas SQL parametrizadas |
| `server/src/pa4/middlewares/` | Autenticación, validación de ID y errores |
| `server/public/images/` | Imágenes servidas por el backend |
| `database/schema.sql` | Crea las cinco tablas y sus restricciones |
| `database/seed.sql` | Inserta seis integrantes, tres categorías y doce plantillas de demostración |
| `database/checks.sql` | Comprueba cantidades, relación e imágenes registradas |
| `scripts/sql.mjs` | Importa o inspecciona SQL usando la conexión configurada |
| `netlify.toml` | Build del frontend y reescritura para rutas de React |

La organización sigue las responsabilidades mostradas en S06, diapositiva 17. No se dispone de los proyectos originales de empleados y tienda, por lo que debe compararse con esos archivos del docente si están disponibles. Las referencias completas están en [REQUISITOS_PA4.md](REQUISITOS_PA4.md).

## Conexión y recorrido de una consulta

`loadSqlConfig` valida los valores de `server/.env.pa4` y las variables del hosting. `createDatabase` crea un pool de `mysql2/promise`, y `checkDatabase` ejecuta `SELECT 1` antes de iniciar el servidor. Las contraseñas quedan en el entorno, no en el código del frontend.

Una petición a `/api/integrantes` pasa por `app.ts`, el router del catálogo, su controlador y `createCatalogModel`. El modelo consulta `integrantes`; el controlador construye la URL de cada imagen y responde `{ success, data }`. React recibe la respuesta y genera una tarjeta por integrante.

La relación maestro-detalle usa `categorias.id` y `plantillas.categoria_id`. Una categoría tiene varias plantillas. El modelo filtra mediante `WHERE p.categoria_id=?` y envía el ID como parámetro, separado de la consulta SQL.

`database/schema.sql` declara `plantillas_categoria_fk`, que impide referencias inexistentes y restringe la eliminación de categorías con plantillas. `database/seed.sql` contiene los registros de demostración; sus cantidades efectivas se deben comprobar contra la base mediante `database/checks.sql`.

## Preguntas para practicar

### 1. ¿Cómo se comunican el frontend y el backend?

**Respuesta.** React hace peticiones HTTP a la API de Express. Express consulta MariaDB y devuelve JSON. React guarda la respuesta en su estado y muestra los datos. El navegador no se conecta directamente a la base de datos.

**Archivo y función.** `client/src/services/catalog.ts`, `get`; `server/src/pa4/models/catalogModel.ts`, `createCatalogModel`.

**Comprende.** `fetch`, `response.json()` y `database.execute`.

### 2. ¿Dónde se inicia el servidor del PA4?

**Respuesta.** En `server/src/pa4/index.ts`. Primero lee y valida la configuración, crea el pool y comprueba la conexión SQL. Después crea la aplicación Express y abre el puerto configurado. Si falla la conexión inicial, no anuncia un arranque correcto.

**Archivo y función.** `server/src/pa4/index.ts`, `start`.

**Comprende.** `loadSqlConfig`, `checkDatabase` y `server.listen`.

### 3. ¿Cómo funciona la conexión a MySQL?

**Respuesta.** Utilizo un pool de `mysql2/promise`. El pool administra varias conexiones y permite ejecutar consultas asíncronas con `await`. Recibe servidor, puerto, usuario, contraseña y base desde variables de entorno, sin incluir esos datos privados en el frontend.

**Archivo y función.** `server/src/pa4/config/database.ts`, `createDatabase`.

**Comprende.** `mysql.createPool` y las propiedades `host`, `database` y `connectionLimit`.

### 4. ¿Por qué se utilizan variables de entorno?

**Respuesta.** Separan el código de la configuración. Puedo cambiar de base o de dominio entre desarrollo y producción sin reescribir las consultas. El backend valida las variables al arrancar y mantiene las credenciales fuera de los archivos públicos.

**Archivo y función.** `server/src/pa4/config/env.ts`, `loadSqlConfig`; `server/.env.pa4.example`.

**Comprende.** `schema.safeParse` y la diferencia entre un ejemplo y un archivo con secretos reales.

### 5. ¿Qué hace una ruta de Express?

**Respuesta.** Asocia un método HTTP y una URL con la función que atiende la petición. Por ejemplo, GET `/api/integrantes` ejecuta el controlador que obtiene los integrantes. El router organiza esas asociaciones y Express lo monta bajo el prefijo `/api`.

**Archivo y función.** `server/src/pa4/routes/catalogRoutes.ts`, `catalogRoutes`; `server/src/pa4/app.ts`, `createSqlApp`.

**Comprende.** `router.get` y `app.use('/api', ...)`.

### 6. ¿Para qué separaste rutas, controladores y modelos?

**Respuesta.** Las rutas indican qué URL atiendo, el controlador prepara la respuesta y el modelo consulta la base. Esta separación evita mezclar todo en un archivo y permite localizar rápidamente un error o un cambio de consulta.

**Archivo y función.** `server/src/pa4/routes/catalogRoutes.ts`, `createCatalogController` en `controllers/catalogController.ts` y `createCatalogModel` en `models/catalogModel.ts`.

**Comprende.** El recorrido de `/api/integrantes` por esas tres capas.

### 7. ¿Los datos del equipo son estáticos en React?

**Respuesta.** No. `TeamPage` solicita los integrantes a la API. El backend los consulta en la tabla `integrantes`. React sólo transforma los registros recibidos en tarjetas, por eso un cambio en la base se refleja en una nueva consulta.

**Archivo y función.** `client/src/pages/TeamPage.tsx`, `TeamPage`; `server/src/pa4/models/catalogModel.ts`, `integrantes`.

**Comprende.** `useCatalog(catalogApi.integrantes)` y el `SELECT` de la tabla.

### 8. ¿Qué es la relación maestro-detalle?

**Respuesta.** Es una relación donde un registro principal agrupa varios secundarios. En TaskFlow la categoría es el maestro y sus plantillas son el detalle. Cada plantilla guarda `categoria_id`, que identifica a la categoría a la que pertenece.

**Archivo y función.** `server/src/pa4/models/catalogModel.ts`, `plantillas` y la consulta `plantillaSelect`.

**Comprende.** `INNER JOIN categorias c ON c.id=p.categoria_id` y el filtro por categoría.

### 9. ¿Cómo evitas inyección SQL en los parámetros?

**Respuesta.** Valido el identificador y ejecuto la consulta con marcadores `?`. El valor va en un arreglo de parámetros, separado del texto SQL. Así no concateno la entrada del usuario como una instrucción SQL ejecutable.

**Archivo y función.** `server/src/pa4/models/catalogModel.ts`, `categoriaExists` y `plantillas`; `server/src/pa4/middlewares/validateId.ts`.

**Comprende.** `database.execute('SELECT id FROM categorias WHERE id=?', [id])`.

### 10. ¿Qué ocurre si piden una categoría inexistente?

**Respuesta.** El controlador comprueba si existe antes de consultar su detalle. Si no existe devuelve un error 404 con un mensaje JSON. Un identificador mal formado se rechaza en el middleware de validación antes de ejecutar la consulta.

**Archivo y función.** `server/src/pa4/controllers/catalogController.ts`, `createCatalogController`; `server/src/pa4/middlewares/validateId.ts`.

**Comprende.** `categoriaExists`, `AppError` y el middleware de ID.

### 11. ¿Para qué sirve useEffect en este proyecto?

**Respuesta.** Ejecuta la carga de datos cuando se monta la vista o cambian sus dependencias. En el catálogo solicita información a la API y actualiza carga, datos y error. Al salir de la vista cancela la petición para evitar actualizaciones fuera de lugar.

**Archivo y función.** `client/src/hooks/useCatalog.ts`, `useCatalog`.

**Comprende.** `useEffect`, sus dependencias y la función de limpieza con `abort.abort()`.

### 12. ¿Para qué sirve useState?

**Respuesta.** Guarda un valor que puede cambiar y que afecta a la interfaz. En la página del equipo almacena el texto de búsqueda. Al escribir, actualizo ese estado y React vuelve a mostrar las tarjetas que coinciden.

**Archivo y función.** `client/src/pages/TeamPage.tsx`, `TeamPage`.

**Comprende.** `const [query, setQuery] = useState('')` y `onChange` del campo.

### 13. ¿Cómo cambia el catálogo al seleccionar una categoría?

**Respuesta.** La categoría elegida se guarda en la URL. La función de carga depende de ese ID y solicita sus plantillas al backend. Al cambiar la categoría, el hook vuelve a ejecutar la petición y muestra los registros asociados.

**Archivo y función.** `client/src/pages/TemplatesPage.tsx`, `TemplatesPage`, `selectCategory` y `loadTemplates`.

**Comprende.** `useSearchParams`, `useCallback` y la dependencia `categoryId`.

### 14. ¿Cómo funciona la página de detalle de una plantilla?

**Respuesta.** React Router toma el ID de la URL mediante `useParams`. La página solicita esa plantilla a la API y muestra su imagen, descripción, categoría, dificultad y estado. El enlace de regreso conserva la categoría de la plantilla.

**Archivo y función.** `client/src/pages/TemplateDetailPage.tsx`, `TemplateDetailPage`.

**Comprende.** `useParams`, la función `load` y el enlace con `categoria_id`.

### 15. ¿Qué hace React Router?

**Respuesta.** Relaciona una URL con un componente y permite navegar sin recargar todo el sitio. `BrowserRouter` administra la navegación, `Routes` selecciona la ruta y `Link` cambia de pantalla. Las rutas dinámicas permiten abrir una plantilla por su ID.

**Archivo y función.** `client/src/main.tsx`; `client/src/App.tsx`, `App`; `client/src/components/SiteSidebar.tsx`, `SiteSidebar`.

**Comprende.** `BrowserRouter`, `Route`, `Link` y `NavLink`.

### 16. ¿Cómo se comparten los datos del usuario?

**Respuesta.** `AuthProvider` mantiene el usuario y las operaciones de sesión en un contexto. Los componentes acceden mediante `useAuth`, sin pasar esas propiedades por cada nivel. Context API es suficiente para este estado compartido y no necesité agregar Redux.

**Archivo y función.** `client/src/context/AuthContext.tsx`, `AuthProvider` y `useAuth`.

**Comprende.** `AuthContext.Provider`, su `value` y `useContext`.

### 17. ¿Cómo funcionan JWT y bcrypt?

**Respuesta.** bcrypt genera el hash de la contraseña y lo compara al iniciar sesión. Si las credenciales son correctas, el servidor emite un JWT firmado y con vencimiento. El cliente lo envía para entrar a las rutas privadas de sus tareas.

**Archivo y función.** `server/src/pa4/controllers/authController.ts`, `createAuthController` y `tokenFor`; `server/src/pa4/middlewares/auth.ts`.

**Comprende.** `bcrypt.hash`, `bcrypt.compare`, `jwt.sign` y la verificación del token.

### 18. ¿Cómo impides consultar las tareas de otro usuario?

**Respuesta.** El servidor obtiene el usuario desde el token verificado y filtra las consultas por el ID de la tarea y por `user_id`. El cliente no decide el propietario. Si la tarea no pertenece al usuario, no se devuelve.

**Archivo y función.** `server/src/pa4/models/taskModel.ts`, `createTaskModel`; `server/src/pa4/middlewares/auth.ts`.

**Comprende.** Las condiciones SQL `id=? AND user_id=?`.

### 19. ¿Qué es CORS y cómo se configura aquí?

**Respuesta.** CORS indica al navegador qué origen puede leer las respuestas de la API. TaskFlow permite el dominio configurado en `CLIENT_ORIGIN`. En producción debe coincidir con el origen HTTPS de Netlify; no reemplaza la autenticación de las rutas privadas.

**Archivo y función.** `server/src/pa4/app.ts`, `createSqlApp`; `server/src/pa4/config/env.ts`, `loadSqlConfig`.

**Comprende.** La función `origin` del middleware `cors`.

### 20. ¿Cómo se manejan los errores de conexión y carga?

**Respuesta.** El backend devuelve un error controlado en JSON y no expone credenciales. En React distingo carga, error y resultado. Si falla la petición, muestro un mensaje y un botón para volver a intentarlo en vez de simular datos exitosos.

**Archivo y función.** `server/src/pa4/middlewares/errors.ts`; `client/src/hooks/useCatalog.ts`, `useCatalog`; `client/src/components/CatalogState.tsx`, `CatalogState`.

**Comprende.** El manejo de rechazo, `error`, `loading` y `retry`.

### 21. ¿Cómo se muestran las imágenes?

**Respuesta.** La base guarda rutas y el backend construye las URLs públicas. Express sirve los archivos desde `/images`. React muestra la imagen con texto alternativo y un estado de error si falla. Los estilos deben mantener sus proporciones y evitar deformaciones.

**Archivo y función.** `server/src/pa4/app.ts`, `express.static`; `server/src/pa4/controllers/catalogController.ts`, `withImage`; `client/src/components/ResourceImage.tsx`, `ResourceImage`.

**Comprende.** La ruta almacenada, `new URL` y el evento `onError`.

### 22. ¿Cómo se implementó la página 404?

**Respuesta.** Una ruta comodín muestra `NotFoundPage` cuando la dirección no coincide con las páginas definidas. La vista conserva la navegación de TaskFlow y permite volver al inicio. El hosting también debe servir la aplicación al abrir directamente una dirección desconocida.

**Archivo y función.** `client/src/pages/NotFoundPage.tsx`, `NotFoundPage`; `client/src/App.tsx`, `App`.

**Comprende.** El enlace `to="/"` y la ruta comodín `*`.

### 23. ¿Qué partes del backend cambian al publicar en AlwaysData?

**Respuesta.** Configuro el host y puerto del proceso, la conexión a la base de AlwaysData, el origen HTTPS de Netlify y la URL HTTPS de la API. Compilo TypeScript y ejecuto la entrada PA4. Las credenciales se configuran en el entorno del servidor.

**Archivo y función.** `server/src/pa4/index.ts`, `start`; `server/src/pa4/config/env.ts`, `loadSqlConfig`; `server/package.json`, scripts `build` y `start`.

**Comprende.** `HOST`, `PORT`, variables `DB_*`, `CLIENT_ORIGIN` y `API_PUBLIC_URL`.

### 24. ¿Cómo sabe React a qué API conectarse en Netlify?

**Respuesta.** Vite incorpora `VITE_API_URL` al generar el sitio. En Netlify debe apuntar a la API HTTPS de AlwaysData con el prefijo `/api`. Si cambio esa dirección, necesito generar y desplegar nuevamente el frontend porque la variable forma parte del build.

**Archivo y función.** `client/src/services/catalog.ts`, `apiBaseUrl`; `client/package.json`, script `build`.

**Comprende.** `import.meta.env.VITE_API_URL` y la petición realizada por `get`.

### 25. ¿Cómo aplicaste Tailwind en las páginas?

**Respuesta.** Vite utiliza el plugin de Tailwind y las páginas aplican utilidades mediante `className`. Por ejemplo, las tarjetas de plantillas usan una columna en móvil y aumentan con los puntos de quiebre. Los estilos compartidos completan la identidad visual de TaskFlow.

**Archivo y función.** `client/vite.config.ts`, `tailwindcss`; `client/src/pages/TemplatesPage.tsx`, `TemplatesPage`.

**Comprende.** `plugins: [react(), tailwindcss()]` y `grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3`.

### 26. ¿Dónde se garantiza la relación entre categorías y plantillas?

**Respuesta.** En la base de datos, mediante la clave foránea `plantillas_categoria_fk`. Cada `categoria_id` debe existir en `categorias.id`. La regla de eliminación restringida impide borrar una categoría mientras tenga plantillas. El JOIN permite consultar también el nombre de su categoría.

**Archivo y función.** `database/schema.sql`, `CREATE TABLE plantillas`; `server/src/pa4/models/catalogModel.ts`, `plantillaSelect`.

**Comprende.** `FOREIGN KEY (categoria_id) REFERENCES categorias (id)` y `ON DELETE RESTRICT`.

### 27. ¿Cómo se importan y comprueban los datos?

**Respuesta.** Primero creo la base y configuro su conexión. `npm run sql:import` ejecuta el esquema y las inserciones, y `npm run sql:inspect` ejecuta las consultas de comprobación. Así puedo demostrar las cantidades y los detalles por categoría contra la base real.

**Archivo y función.** `scripts/sql.mjs`, selección de `mode` y ejecución de sentencias; `database/schema.sql`, `seed.sql` y `checks.sql`.

**Comprende.** Los archivos elegidos por modo y el conteo agrupado de plantillas por categoría.

### 28. ¿Por qué una ruta funciona al navegar y también al recargar en Netlify?

**Respuesta.** Netlify reescribe las rutas a `index.html` y entrega la aplicación React. Después React Router decide qué página mostrar. En una ruta desconocida muestra la vista 404. Esta vista es de la aplicación, aunque la reescritura del hosting entregue HTTP 200.

**Archivo y función.** `netlify.toml`, bloque `redirects`; `client/src/App.tsx`, `App`; `client/src/pages/NotFoundPage.tsx`, `NotFoundPage`.

**Comprende.** `from = "/*"`, `to = "/index.html"`, `status = 200` y la ruta comodín de React.

## Cómo preparar una demostración breve

1. Abre la carpeta del repositorio en VS Code. En una ventana puedes mostrar `client`; en otra, `server`. También puedes utilizar una ventana con ambas carpetas visibles, siempre que puedas abrir sus archivos rápidamente.
2. Abre `server/src/pa4/index.ts`, `config/database.ts`, `routes/catalogRoutes.ts`, `controllers/catalogController.ts` y `models/catalogModel.ts`. Recorre una consulta de integrantes sin abrir archivos con contraseñas.
3. Abre `client/src/pages/TeamPage.tsx`, `TemplatesPage.tsx`, `hooks/useCatalog.ts` y `services/catalog.ts`. Explica la petición y el renderizado de tarjetas.
4. Entra al panel de AlwaysData con tu cuenta, abre Bases de datos y accede a phpMyAdmin mediante el enlace del panel. Selecciona la base del PA4 y muestra la estructura y los registros de `integrantes`, `categorias` y `plantillas`.
5. En phpMyAdmin muestra `categoria_id` y su relación con `categorias.id`. Abre la pestaña SQL y ejecuta las consultas de `database/checks.sql` para mostrar cantidades, detalles por categoría y claves foráneas. Evita mostrar el contenido de `users` o cualquier archivo de credenciales.
6. En el sitio publicado abre Nuestro equipo, selecciona una categoría, entra a una plantilla y vuelve a su categoría. Recarga una URL de detalle y abre una ruta inexistente para mostrar la vista 404.
7. Abre en otra pestaña los endpoints públicos para enseñar el JSON y una imagen. Conserva abiertas las pestañas necesarias antes de empezar la sustentación.

Los enlaces públicos y los resultados deben verificarse antes de la presentación. Esta guía no inventa un dominio de AlwaysData o Netlify ni asegura que una cuenta esté autenticada.

## Comandos para comprender y practicar localmente

Desde la raíz del repositorio, `npm install` instala las dependencias y `npm run setup` crea los entornos que falten a partir de sus ejemplos, conservando los existentes. Configura una base MySQL/MariaDB existente y un usuario autorizado en `server/.env.pa4` antes de importar. Las credenciales reales no deben copiarse a esta guía.

```sh
npm run sql:import
npm run sql:inspect
npm run dev
```

`npm run dev` inicia el backend PA4 y Vite. `npm run build` compila ambos proyectos y `npm run typecheck` revisa los tipos. Estos comandos explican el procedimiento y no equivalen a un resultado aprobado; consulta los reportes reales para conocer su última ejecución.

Para importar en AlwaysData, selecciona primero la base autorizada en phpMyAdmin y usa la pestaña Importar con `database/schema.sql` y después `database/seed.sql`. Ejecuta `database/checks.sql` en la pestaña SQL. El esquema no crea ni selecciona una base de nombre fijo, por lo que utiliza la seleccionada en el panel.

## Repaso antes de responder

Explica qué entrada recibe una función, qué consulta o petición realiza y qué devuelve. Si te preguntan por un archivo, ábrelo y señala la instrucción concreta. Practica cada respuesta con un cronómetro y evita leer todo el documento durante la exposición.

Comprueba que puedes distinguir las credenciales privadas del backend de `VITE_API_URL`, que es una configuración pública. Repasa también el recorrido categoría → endpoint → consulta parametrizada → JSON → estado de React → tarjetas.
