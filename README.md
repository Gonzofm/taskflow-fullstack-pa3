# TaskFlow

## Descripción de TaskFlow

TaskFlow es una aplicación web para gestionar tareas personales. Cada cuenta tiene un panel privado desde el que puede consultar y actualizar sus tareas. La interfaz en React consume una API REST en Express, y los usuarios y las tareas se guardan en MongoDB.

## Objetivo de la aplicación

TaskFlow reúne las tareas personales en un solo lugar. Permite ordenar el trabajo por prioridad y distinguir lo pendiente de lo completado, de modo que cada usuario pueda decidir qué hacer a continuación y seguir su progreso desde un espacio privado.

## Tecnologías utilizadas

| Capa | Tecnologías |
| --- | --- |
| Frontend | React, TypeScript, Vite, React Router y CSS |
| Backend | Node.js, Express y TypeScript |
| Base de datos | MongoDB y Mongoose |
| Autenticación | JWT y bcryptjs |
| Pruebas de integración | Vitest y Supertest |

## Funcionalidades principales

- Registro, inicio y cierre de sesión.
- Creación, edición y eliminación de tareas con confirmación de borrado.
- Prioridades baja, media y alta, y cambio de estado entre pendiente y completada.
- Búsqueda, filtros, ordenamiento e indicadores de progreso en el panel.

Al registrarse, el servidor guarda un hash de la contraseña con bcrypt. En el inicio de sesión, compara la contraseña ingresada con ese hash. El cliente guarda el JWT firmado en `sessionStorage` y lo elimina al cerrar sesión. La API comprueba la firma y la caducidad del token y limita el acceso a las tareas del usuario autenticado.

## Estructura del proyecto

| Carpeta | Contenido |
| --- | --- |
| `client/` | Interfaz y consumo de la API |
| `server/` | Rutas, controladores, modelos y pruebas |
| `scripts/` | Configuración inicial, MongoDB local y verificación |
| `docs/evidencias/` | Capturas y resultados de pruebas |

## Requisitos e instalación

Necesitas Node.js 22.12 o superior, npm 10 o superior, Git y conexión a Internet para instalar las dependencias. Para la base de datos puedes usar el lanzador local incluido, un servicio MongoDB instalado o un clúster de Atlas.

```bash
git clone https://github.com/Gonzofm/taskflow-fullstack-pa3.git
cd taskflow-fullstack-pa3
npm install
npm run setup
```

`npm install` instala las dependencias de ambos workspaces. `npm run setup` crea los archivos `.env` a partir de [server/.env.example](server/.env.example) y [client/.env.example](client/.env.example), y genera un secreto JWT para el servidor. Si los archivos ya existen, el script los conserva.

## Configuración de MongoDB y variables de entorno

### MongoDB local

Desde la raíz del repositorio, inicia el lanzador en una terminal y espera a que MongoDB esté listo.

```bash
npm run db:start
```

El lanzador descarga el binario de MongoDB si hace falta y guarda los datos en `.local/mongodb`. Mantén la terminal abierta mientras usas TaskFlow. Si ya tienes MongoDB instalado, inicia ese servicio y usa su URI en `server/.env` en lugar del lanzador.

### MongoDB Atlas

Crea un clúster y un usuario de base de datos con permisos sobre `taskflow`. Autoriza la IP del backend en **Network Access** y configura `MONGODB_URI` en `server/.env` con la cadena que aparece en **Connect → Drivers**. Sustituye los valores del ejemplo y codifica los caracteres especiales de la contraseña para que sean válidos en la URI.

```dotenv
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA_CODIFICADA@CLUSTER.mongodb.net/taskflow?retryWrites=true&w=majority
```

Con Atlas, continúa directamente con `npm run dev` una vez configurada la conexión.

### Variables de entorno

| Archivo | Variable | Valor local o uso |
| --- | --- | --- |
| `server/.env` | `NODE_ENV` | `development` |
| `server/.env` | `PORT` | `4000` |
| `server/.env` | `MONGODB_URI` | `mongodb://127.0.0.1:27017/taskflow` o la URI de Atlas |
| `server/.env` | `JWT_SECRET` | Secreto privado de al menos 32 bytes generado por `npm run setup` |
| `server/.env` | `JWT_EXPIRES_IN_SECONDS` | `3600` (una hora) |
| `server/.env` | `AUTH_RATE_LIMIT_MAX` | `20` intentos de autenticación por cada 15 minutos |
| `server/.env` | `CLIENT_ORIGIN` | `http://localhost:5173`, sin barra final |
| `client/.env` | `VITE_API_URL` | `http://localhost:4000/api` |

Guarda la URI y el secreto JWT en el servidor. Los archivos `.env` están excluidos de Git. Si cambias los puertos, actualiza `VITE_API_URL` y `CLIENT_ORIGIN` según corresponda y reinicia ambos servicios.

## Ejecución de la aplicación

Con MongoDB disponible, abre otra terminal en la raíz y ejecuta ambos servicios.

```bash
npm run dev
```

Abre el [frontend](http://localhost:5173) en el navegador. Puedes comprobar la conexión de la API con MongoDB en [`/api/health`](http://localhost:4000/api/health).

Para levantar cada servicio por separado, ejecuta un comando por terminal desde la raíz.

```bash
npm run dev --workspace @taskflow/server
npm run dev --workspace @taskflow/client
```

`npm run build` compila ambos workspaces. Con MongoDB disponible, `npm run start` inicia la API compilada. Para revisar el frontend compilado con la API activa, usa `npm run preview --workspace @taskflow/client -- --port 5173` con el frontend de desarrollo detenido.

## API REST y pruebas

La URL base es `http://localhost:4000/api`. Las rutas protegidas reciben el encabezado `Authorization: Bearer <token>`.

| Método | Ruta | JWT | Operación |
| --- | --- | --- | --- |
| GET | `/health` | No | Comprueba el estado de la API y de MongoDB |
| POST | `/auth/register` | No | Registra al usuario y devuelve un token |
| POST | `/auth/login` | No | Inicia sesión y devuelve un token |
| GET | `/auth/me` | Sí | Consulta el perfil de la sesión |
| GET | `/tasks` | Sí | Lista las tareas propias |
| POST | `/tasks` | Sí | Crea una tarea propia |
| GET | `/tasks/:id` | Sí | Consulta una tarea propia |
| PUT | `/tasks/:id` | Sí | Actualiza una tarea propia |
| DELETE | `/tasks/:id` | Sí | Elimina una tarea propia |

El registro recibe `name`, `email` y `password`. Las tareas usan `title`, `description`, `priority` y `status`, y su propietario se identifica a partir del token.

```bash
npm run typecheck
npm run build
npm test
```

Las pruebas de integración usan una instancia temporal de MongoDB y cubren autenticación, gestión de tareas y aislamiento entre cuentas. `npm run verify` ejecuta las tres comprobaciones y guarda sus resultados en `docs/evidencias/`.

## Evidencias y repositorio

- [Captura del panel de tareas](docs/evidencias/05-tareas-guardadas.jpg)
- [Guía de evidencias y capturas](docs/evidencias/README.md)
- [Resultados de las pruebas de integración](docs/evidencias/test.txt)
- [Repositorio público de TaskFlow en GitHub](https://github.com/Gonzofm/taskflow-fullstack-pa3)
