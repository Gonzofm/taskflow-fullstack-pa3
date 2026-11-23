# TaskFlow

## Descripción de TaskFlow

TaskFlow reúne tareas personales, perfiles de un equipo y una biblioteca de plantillas de productividad. React consume una API REST en Express y los datos de esta versión se guardan en MySQL/MariaDB.

El desarrollo actual está en [`pa4-desarrollo`](https://github.com/Gonzofm/taskflow-fullstack-pa3/tree/pa4-desarrollo). La versión anterior con MongoDB permanece en [`main`, commit `40b6872`](https://github.com/Gonzofm/taskflow-fullstack-pa3/tree/40b6872); su código y scripts se conservan.

## Objetivo de la aplicación

Facilitar la organización de actividades personales y laborales mediante un espacio que permita administrar tareas, establecer prioridades y consultar recursos de productividad. TaskFlow ayuda a convertir objetivos en acciones concretas y a seguir el avance de lo pendiente y lo completado.

## Tecnologías utilizadas

| Capa | Tecnologías |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router y Tailwind CSS |
| Backend | Node.js, Express y TypeScript |
| Base de datos | MySQL/MariaDB, mysql2 y consultas parametrizadas |
| Autenticación | JWT y bcryptjs |
| Verificación | Vitest, Supertest y MariaDB real |
| Publicación | AlwaysData para API y SQL; Netlify para React |

## Funcionalidades principales

- Registro, inicio y cierre de sesión, con tareas privadas por usuario.
- Creación, edición, eliminación, prioridades, filtros y seguimiento de tareas.
- Nuestro equipo, con seis perfiles e imágenes cargados desde la API.
- Biblioteca con tres categorías, doce plantillas y cuatro recursos por categoría.
- Selección de categoría, búsqueda, detalle de plantilla y página 404 propia.

bcrypt guarda y compara hashes de contraseñas. JWT identifica la sesión mediante un token firmado con caducidad; la API lo valida y comprueba el propietario de cada tarea. El navegador lo conserva en `sessionStorage` hasta cerrar la sesión.

## Estructura del proyecto

| Carpeta | Contenido |
| --- | --- |
| `client/src/` | Páginas, componentes, contextos y consumo de API |
| `server/src/pa4/` | Configuración SQL, modelos, controladores, rutas y middleware |
| `server/src/` | Implementación MongoDB conservada del PA3 |
| `server/public/images/` | Fotografías y vistas de plantillas |
| `database/` | `schema.sql`, `seed.sql` y `checks.sql` |
| `scripts/` | Configuración, importación SQL y verificación |
| `docs/` | Requisitos, auditoría, evidencias y sustentación |

## Requisitos e instalación

Necesitas Node.js 22.12 o superior, npm 10 o superior, Git y un servidor MySQL/MariaDB. La instalación local se ha preparado con MariaDB; el servidor debe estar iniciado antes de importar los datos.

```bash
git clone --branch pa4-desarrollo https://github.com/Gonzofm/taskflow-fullstack-pa3.git
cd taskflow-fullstack-pa3
npm install
npm run setup
```

El setup crea `server/.env.pa4` y `client/.env` desde [server/.env.pa4.example](server/.env.pa4.example) y [client/.env.example](client/.env.example), genera un secreto JWT y conserva los archivos existentes. Completa las credenciales SQL antes de continuar. Los archivos privados están excluidos de Git.

## Configuración de MySQL/MariaDB y variables de entorno

Crea una base `taskflow_pa4` con codificación `utf8mb4` y un usuario con permisos sobre esa base. Configura su conexión en `server/.env.pa4`. El ejemplo usa el puerto `3307`; ajusta `DB_PORT` al puerto real de tu instalación, habitualmente `3306`.

```bash
npm run sql:import
npm run sql:inspect
```

La importación ejecuta [schema.sql](database/schema.sql) y [seed.sql](database/seed.sql). También puedes seleccionar la base en phpMyAdmin e importar ambos archivos, en ese orden. No incluyen `CREATE DATABASE`, `USE` ni borrado de tablas. Las consultas de [checks.sql](database/checks.sql) comprueban los registros y las relaciones.

`plantillas.categoria_id` referencia `categorias.id` mediante una clave foránea. Las tablas adicionales `users` y `tasks` mantienen las cuentas y tareas privadas. Las imágenes se guardan como rutas; Express sirve los archivos correspondientes.

| Archivo | Variable | Configuración |
| --- | --- | --- |
| `server/.env.pa4` | `NODE_ENV` | `development` local; `production` en hosting |
| `server/.env.pa4` | `HOST`, `PORT` | `127.0.0.1`, `4000` local; valores asignados por AlwaysData |
| `server/.env.pa4` | `DB_HOST`, `DB_PORT` | Dirección y puerto de MySQL/MariaDB |
| `server/.env.pa4` | `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Usuario, contraseña y base SQL |
| `server/.env.pa4` | `DB_SSL` | `false` local; `true` si el servidor exige TLS |
| `server/.env.pa4` | `CLIENT_ORIGIN` | Origen exacto del frontend, `http://localhost:5173` local |
| `server/.env.pa4` | `API_PUBLIC_URL` | Origen de la API, `http://localhost:4000` local |
| `server/.env.pa4` | `JWT_SECRET` | Secreto privado de al menos 32 bytes generado por el setup |
| `server/.env.pa4` | `JWT_EXPIRES_IN_SECONDS`, `AUTH_RATE_LIMIT_MAX` | `3600` y `20` en el ejemplo |
| `client/.env` | `VITE_API_URL` | `http://localhost:4000/api` local; API HTTPS de AlwaysData seguida de `/api` en Netlify |

Los orígenes no llevan ruta ni barra final. Reinicia los servicios después de cambiar variables; las variables `VITE_` se incorporan al build y son públicas. Las credenciales SQL y el secreto JWT pertenecen exclusivamente al servidor.

## Ejecución de la aplicación

Con SQL configurado e importado, inicia ambos servicios desde la raíz.

```bash
npm run dev
```

Abre [TaskFlow](http://localhost:5173) y comprueba la conexión en [`/api/health`](http://localhost:4000/api/health). Para ejecutar los servicios por separado, usa una terminal por comando.

```bash
npm run dev --workspace @taskflow/server
npm run dev --workspace @taskflow/client
```

`npm run build` compila ambos workspaces y `npm start` inicia la API compilada. El frontend compilado puede revisarse con `npm run preview --workspace @taskflow/client -- --port 5173`, con Vite de desarrollo detenido.

En AlwaysData se utiliza el paquete independiente `deployment/alwaysdata`. Instala con `npm ci --prefix deployment/alwaysdata --include=dev --ignore-scripts` y compila con `npm run build --prefix deployment/alwaysdata`. El sitio Node.js ejecuta `server/dist/pa4/index.js` desde ese directorio y recibe `IP` y `PORT` del hosting. Su archivo privado está en `deployment/alwaysdata/server/.env.pa4`. La [guía de sustentación](docs/SUSTENTACION_PA4.md) detalla la configuración.

Netlify usa [netlify.toml](netlify.toml), compila el workspace del cliente y publica `client/dist`. Configura `VITE_API_URL` antes del build. La regla `/* /index.html 200` permite recargar rutas de React Router; las rutas desconocidas muestran la página 404 de TaskFlow.

## API REST y pruebas

La base local es `http://localhost:4000/api`. Las rutas privadas reciben `Authorization: Bearer <token>`.

| Método | Ruta | Operación |
| --- | --- | --- |
| GET | `/health` | Estado de API y conexión SQL |
| GET | `/integrantes` | Perfiles del equipo con imágenes |
| GET | `/categorias` | Categorías y número de plantillas |
| GET | `/plantillas` | Catálogo completo |
| GET | `/plantillas/categoria/:id` | Plantillas de una categoría |
| GET | `/plantillas/:id` | Detalle de una plantilla |
| POST | `/auth/register`, `/auth/login` | Registro e inicio de sesión |
| GET | `/auth/me` | Perfil autenticado |
| GET, POST | `/tasks` | Consultar y crear tareas propias |
| GET, PUT, DELETE | `/tasks/:id` | Consultar, actualizar y eliminar una tarea propia |

```bash
npm run typecheck
npm run build
npm test
npm run audit:comments
```

Las pruebas SQL necesitan una base independiente llamada `taskflow_pa4_test`, con permisos para el mismo usuario. Puedes definir `DB_TEST_NAME` con otro nombre terminado en `_test`. La suite importa sus tablas y datos; no utiliza la base de la aplicación. `npm run verify` reúne las comprobaciones y guarda sus resultados en `docs/evidencias/pa4/`.

## Evidencias y repositorio

- [Requisitos y fuentes del curso](docs/REQUISITOS_PA4.md), [auditoría PA4](docs/AUDITORIA_PA4.md) y [guía de sustentación](docs/SUSTENTACION_PA4.md).
- [Plantilla Mytask en ThemeForest](https://themeforest.net/item/mytask-react-redux-project-management-admin-template/35386552). La adaptación utiliza recursos propios o permitidos y Open Sans.
- [Código de TaskFlow PA4](https://github.com/Gonzofm/taskflow-fullstack-pa3/tree/pa4-desarrollo).
- [API pública en AlwaysData](https://taskflow4.alwaysdata.net/api/integrantes) y [TaskFlow en Netlify](https://taskflow-pa4-gonzofm.netlify.app), verificados mediante HTTP y navegador.
- [Evidencias PA4](docs/evidencias/pa4/README.md), [pruebas y build](docs/evidencias/pa4/verificacion.json) y [comprobación pública](docs/evidencias/pa4/publicacion.json).
