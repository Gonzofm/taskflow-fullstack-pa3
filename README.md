# TaskFlow — Gestor de Tareas Personales

Aplicación web full-stack para organizar tareas personales mediante cuentas independientes. React consume una API REST de Express; Mongoose almacena usuarios y tareas en **MongoDB real**. La autorización se aplica en el servidor a cada operación.

**Verificado el 2 de noviembre de 2026:** dependencias instaladas, TypeScript y builds correctos, **18/18 pruebas de integración aprobadas** con MongoDB real 8.0.17, incluido reinicio de `mongod` conservando la última actualización. La ejecución de referencia está fechada `2026-11-02T19:53:58.552Z` en el [reporte](docs/evidencias/verificacion.json). También se ejecutaron los flujos principales en el navegador y se guardaron capturas reales. El código ya está publicado en el **[repositorio público de TaskFlow](https://github.com/Gonzofm/taskflow-fullstack-pa3)**. Consulta la [auditoría final](docs/AUDITORIA.md) y el [manifiesto de evidencias](docs/evidencias/MANIFIESTO.md). La guía explica cómo obtener una captura auténtica complementaria de MongoDB Compass.

## 1. Objetivo académico

Producto Académico N.º 3 (PA3), Desarrollo Web Full-Stack, ISIL. El proyecto cubre frontend (6 puntos), backend (5), MongoDB (4), autenticación (3) y documentación (2). La [auditoría](docs/AUDITORIA.md) relaciona requisitos, archivos y comprobaciones. La nota final corresponde al docente; este repositorio no garantiza una calificación.

## 2. Características principales

- Registro con nombre, correo y contraseña; inicio y cierre de sesión.
- JWT con expiración y dashboard privado.
- Creación, consulta, edición, finalización y eliminación de tareas propias.
- Título, descripción, prioridad baja/media/alta y estado pendiente/completada.
- Búsqueda, filtros, indicadores y estados de carga, error y lista vacía.
- Formularios controlados, validaciones, confirmación de eliminación y notificaciones.
- Diseño responsive y componentes reutilizables.
- Contraseñas hasheadas, validación del propietario, CORS y errores JSON.

## 3. Stack tecnológico

| Capa | Tecnologías |
| --- | --- |
| Interfaz | React, TypeScript, Vite, React Router, Fetch, CSS y Lucide |
| API | Node.js, Express, TypeScript, dotenv |
| Datos | MongoDB y Mongoose |
| Seguridad | bcryptjs, JSON Web Token, validaciones de entrada, Helmet y limitación de solicitudes |
| Pruebas | Vitest, Supertest y un proceso real de MongoDB para integración |
| Desarrollo local | npm workspaces y scripts de configuración y MongoDB local |

Las versiones instaladas quedan fijadas en `package-lock.json`.

## 4. Arquitectura del sistema

```mermaid
flowchart LR
    U[Usuario] --> C[React + TypeScript :5173]
    C -->|HTTP JSON / Authorization Bearer| A[Express REST :4000]
    A --> V[Validación + middleware JWT]
    V --> CT[Controladores]
    CT --> M[Modelos Mongoose]
    M --> D[(MongoDB: usuarios y tareas)]
```

El cliente conserva temporalmente el token de sesión y solicita datos reales a la API. El servidor verifica firma y expiración, identifica al usuario y añade su identificador al filtro de todas las consultas de tareas. El navegador no decide quién es el propietario. [Detalle de arquitectura y decisiones](docs/ARQUITECTURA.md).

## 5. Estructura de carpetas

```text
proyecto-fullstack/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   └── package.json
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   ├── types/
│   │   ├── app.ts
│   │   └── index.ts
│   ├── .env.example
│   └── package.json
├── scripts/
├── docs/
│   ├── evidencias/
│   ├── ARQUITECTURA.md
│   └── AUDITORIA.md
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

## 6. Requisitos previos

- Node.js 22 LTS y npm 10 o versiones compatibles con los `engines` del proyecto.
- Terminal PowerShell, Bash o equivalente.
- Internet durante `npm install` y la primera descarga del ejecutable MongoDB local.
- MongoDB local o una cadena de conexión de MongoDB Atlas. La opción portable incluida descarga y ejecuta un `mongod` real.
- Navegador actualizado. MongoDB Compass es opcional para inspeccionar documentos.

## 7. Instalación

Abre una terminal en la raíz del repositorio, donde está `package.json`:

```powershell
npm install
npm run setup
```

`npm install` instala las dependencias de ambos workspaces. El script de configuración prepara los archivos locales de entorno y genera un secreto de desarrollo. No publiques esos archivos. Para una instalación idéntica después de clonar, utiliza `npm ci` cuando exista `package-lock.json`.

## 8. Configurar MongoDB

### Opción A: MongoDB local portable incluido

En una terminal independiente:

```powershell
npm run db:start
```

La primera ejecución puede tardar mientras descarga el binario oficial de MongoDB. Este script utiliza `mongodb-memory-server-core` como lanzador de un **proceso `mongod` real**, con motor WiredTiger y datos en disco en `.local/mongodb`. Su nombre de paquete no implica que la aplicación use datos simulados ni una base alternativa. Mantén esta terminal abierta; `Ctrl+C` detiene el proceso conservando los datos.

Cadena local esperada en `server/.env`:

```dotenv
MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
```

Esta opción académica escucha localmente. No expongas ese puerto a Internet. No ejecutes dos servidores sobre el mismo directorio de datos.

### Opción B: MongoDB Community instalado

Inicia tu servicio MongoDB y utiliza una URI de tu instancia local. Si ya usa el puerto 27017, no ejecutes simultáneamente el lanzador portable. Consulta la [instalación oficial de MongoDB Community](https://www.mongodb.com/docs/manual/administration/install-community/).

### Opción C: MongoDB Atlas

1. Crea un clúster en tu cuenta de Atlas.
2. Crea un usuario de base de datos con permisos sobre `taskflow`.
3. Autoriza la IP desde la que ejecutarás el backend en Network Access.
4. Copia la cadena de conexión de Drivers y colócala **únicamente** en `server/.env`.
5. Sustituye usuario, contraseña y clúster; codifica caracteres especiales de la contraseña con percent-encoding.
6. No ejecutes `npm run db:start` cuando uses Atlas.

```dotenv
MONGODB_URI=mongodb+srv://USUARIO:CONTRASENA_CODIFICADA@CLUSTER.mongodb.net/taskflow?retryWrites=true&w=majority
```

La URI anterior es un ejemplo sin credenciales reales. Sigue la [guía oficial de conexión de Atlas](https://www.mongodb.com/docs/atlas/connect-to-database-deployment/).

## 9. Variables de entorno

Usa los archivos `.env.example` como contrato de configuración. Los `.env` locales están excluidos de Git.

| Archivo | Variable | Uso |
| --- | --- | --- |
| `server/.env` | `PORT` | Puerto de API, normalmente `4000` |
| `server/.env` | `MONGODB_URI` | URI de MongoDB local o Atlas |
| `server/.env` | `JWT_SECRET` | Secreto aleatorio privado, al menos 32 bytes |
| `server/.env` | `JWT_EXPIRES_IN_SECONDS` | Duración del token; `3600` equivale a una hora |
| `server/.env` | `CLIENT_ORIGIN` | Origen autorizado, `http://localhost:5173` |
| `server/.env` | `NODE_ENV` | `development`, `test` o `production` |
| `server/.env` | `AUTH_RATE_LIMIT_MAX` | Máximo de intentos de autenticación por ventana de 15 minutos; por defecto `20` |
| `client/.env` | `VITE_API_URL` | URL pública de la API, `http://localhost:4000/api` |

Las variables `VITE_*` son públicas en el navegador. **Nunca coloques el secreto JWT o la URI de Atlas en el cliente.** Reinicia los procesos después de cambiar un `.env`.

## 10. Ejecutar frontend y backend

Con MongoDB ya iniciado, abre otra terminal en la raíz del proyecto:

```powershell
npm run dev
```

Accede a [TaskFlow local](http://localhost:5173). La API está en [http://localhost:4000/api/health](http://localhost:4000/api/health).

Para ejecutar cada workspace en su propia terminal:

```powershell
npm run dev --workspace @taskflow/server
```

```powershell
npm run dev --workspace @taskflow/client
```

Compilación y ejecución del backend compilado:

```powershell
npm run typecheck
npm run build
npm run start
```

Para revisar la compilación del cliente, ejecuta `npm run preview --workspace @taskflow/client -- --port 5173`. El servidor de preview requiere que el backend y MongoDB estén activos. No equivale a un despliegue de producción.

## 11. Endpoints REST

Prefijo: `http://localhost:4000/api`. Las rutas protegidas requieren `Authorization: Bearer TOKEN`.

| Método | Ruta | Autenticación | Resultado |
| --- | --- | --- | --- |
| GET | `/health` | No | Estado de API y conexión de MongoDB |
| POST | `/auth/register` | No | Crea usuario y devuelve usuario y JWT (`201`) |
| POST | `/auth/login` | No | Valida credenciales y devuelve usuario y JWT (`200`) |
| GET | `/auth/me` | Sí | Devuelve el usuario autenticado (`200`) |
| GET | `/tasks` | Sí | Lista exclusivamente tareas propias (`200`) |
| POST | `/tasks` | Sí | Crea una tarea con propietario derivado del JWT (`201`) |
| GET | `/tasks/:id` | Sí | Consulta una tarea propia (`200`) |
| PUT | `/tasks/:id` | Sí | Actualiza los campos permitidos de una tarea propia (`200`) |
| DELETE | `/tasks/:id` | Sí | Elimina una tarea propia (`200`) |

Respuestas exitosas: `{ "success": true, "data": { ... } }`; la eliminación devuelve `{ "success": true, "message": "..." }`. Los errores incluyen `{ "success": false, "message": "..." }` y, cuando corresponde, una lista `errors` de campo y mensaje.

| Código | Significado |
| --- | --- |
| `200` | Consulta, actualización o eliminación correctas |
| `201` | Usuario o tarea creados |
| `400` | Entrada inválida, ObjectId inválido, correo duplicado o solicitud malformada |
| `401` | Credenciales incorrectas o token ausente, inválido o vencido |
| `403` | Origen CORS rechazado |
| `404` | Ruta o tarea no encontrada, incluidas tareas de otra cuenta |
| `413` | Cuerpo de solicitud demasiado grande |
| `429` | Límite de intentos alcanzado |
| `500` | Error inesperado, sin detalles internos en la respuesta |
| `503` | Servicio de datos no disponible en comprobación de salud |

Una tarea ajena devuelve `404` para evitar revelar su existencia. No se debe interpretar como autorización fallida en el cliente: la API filtra por propietario en la propia consulta.

## 12. Registrar usuarios

En la aplicación, abre **Crear cuenta**, introduce nombre, correo válido y una contraseña de al menos ocho caracteres. El servidor normaliza el correo y aplica las validaciones de nuevo.

Ejemplo PowerShell contra la API:

```powershell
$base = 'http://localhost:4000/api'
$body = @{
  name = 'Estudiante PA3'
  email = 'estudiante@example.com'
  password = 'Aprendizaje2026!'
} | ConvertTo-Json
$registro = Invoke-RestMethod -Method Post -Uri "$base/auth/register" -ContentType 'application/json' -Body $body
$token = $registro.data.token
$headers = @{ Authorization = "Bearer $token" }
```

La contraseña mostrada es un ejemplo público para una cuenta de prueba, no una credencial de producción. No reutilices contraseñas personales.

Respuesta esquemática; los valores entre marcadores se generan en cada ejecución:

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<ObjectId del usuario>",
      "name": "Estudiante PA3",
      "email": "estudiante@example.com",
      "createdAt": "<fecha ISO>",
      "updatedAt": "<fecha ISO>"
    },
    "token": "<JWT firmado por el servidor>"
  }
}
```

## 13. Iniciar y cerrar sesión

En **Iniciar sesión**, utiliza el correo y contraseña registrados. El dashboard requiere una sesión válida; al recargar se consulta `/auth/me` para validarla.

```powershell
$body = @{ email = 'estudiante@example.com'; password = 'Aprendizaje2026!' } | ConvertTo-Json
$sesion = Invoke-RestMethod -Method Post -Uri "$base/auth/login" -ContentType 'application/json' -Body $body
$headers = @{ Authorization = "Bearer $($sesion.data.token)" }
Invoke-RestMethod -Method Get -Uri "$base/auth/me" -Headers $headers
```

**Cerrar sesión** elimina el token del navegador y vuelve a la pantalla de acceso. Un token expirado o rechazado por la API también invalida la sesión local. Esta implementación académica no utiliza refresh tokens ni una lista de revocación: un JWT ya emitido sigue siendo válido hasta su vencimiento aunque el usuario cierre la sesión en el navegador.

## 14. Crear, listar, actualizar y eliminar tareas

Desde el dashboard, pulsa **Nueva tarea**, completa el formulario y guarda. Las tareas se obtienen y persisten en MongoDB. Usa las acciones de una tarjeta para editar, completar o eliminar; la eliminación requiere confirmación.

```powershell
$body = @{
  title = 'Preparar entrega PA3'
  description = 'Revisar las evidencias y explicar la arquitectura.'
  priority = 'high'
  status = 'pending'
} | ConvertTo-Json
$creada = Invoke-RestMethod -Method Post -Uri "$base/tasks" -Headers $headers -ContentType 'application/json' -Body $body
$id = $creada.data.task.id
Invoke-RestMethod -Method Get -Uri "$base/tasks" -Headers $headers
Invoke-RestMethod -Method Get -Uri "$base/tasks/$id" -Headers $headers
$cambios = @{ status = 'completed' } | ConvertTo-Json
Invoke-RestMethod -Method Put -Uri "$base/tasks/$id" -Headers $headers -ContentType 'application/json' -Body $cambios
Invoke-RestMethod -Method Delete -Uri "$base/tasks/$id" -Headers $headers
```

Valores de API: `priority` admite `low`, `medium`, `high`; `status` admite `pending`, `completed`. `user` es asignado por el servidor: enviarlo desde el cliente se rechaza. Nunca incluyas un token real en una captura o archivo público.

## 15. JWT, bcrypt y manejo de sesión

- **bcryptjs** transforma la contraseña en un hash con salt. El login compara la contraseña recibida contra ese hash; la API no devuelve contraseñas ni hashes. El límite de 72 bytes evita truncamientos silenciosos de bcrypt.
- **JWT** contiene la identidad y una expiración, y se firma con `JWT_SECRET`. Cada petición protegida verifica la firma y la vigencia antes de consultar datos.
- **`sessionStorage`** conserva sólo el token durante la sesión de la pestaña; permite recargar. Las tareas y los usuarios permanecen en MongoDB. El almacenamiento de sesión es accesible por JavaScript: para producción conviene evaluar cookies HttpOnly, HTTPS, rotación y revocación según el modelo de amenazas.
- No hay logs de credenciales ni tokens. Los errores públicos no incluyen stack traces.
- Los esquemas rechazan tipos, campos y enumeraciones no permitidos. Las consultas nunca toman un propietario arbitrario del cuerpo HTTP.

Referencia de comportamiento de sesión: [MDN: sessionStorage](https://developer.mozilla.org/en-US/docs/Web/API/Window/sessionStorage).

## 16. Pruebas de funcionamiento

La verificación completa con registro automático de resultados se ejecuta mediante:

```powershell
npm run verify
```

Este comando ejecuta secuencialmente TypeScript, builds y pruebas, guarda sus salidas en `docs/evidencias/` y genera `verificacion.json`. Si una comprobación falla, devuelve un código de error y detiene la secuencia. También pueden ejecutarse por separado:

```powershell
npm run typecheck
npm run build
npm test
```

La suite de integración usa una instancia temporal y aislada de **MongoDB real**, sin reemplazar Mongoose con mocks. Puede descargar el ejecutable la primera vez. No utiliza la base personal de `server/.env` ni debería requerir credenciales Atlas. Los logs públicos sustituyen la ruta del equipo por `<proyecto>`.

**Resultado obtenido:** `npm run verify` terminó con código `0`; TypeScript y ambos builds terminaron correctamente; la suite aprobó **18 de 18 pruebas**. Se comprobaron registro y hash bcrypt, correo duplicado, login correcto e incorrecto, JWT válido/ausente/inválido/expirado, `/auth/me`, CRUD, aislamiento entre cuentas, ObjectId inválido, validaciones, CORS y límites de intentos. La prueba de persistencia cerró MongoDB y la aplicación, reinició un proceso `mongod` real sobre el mismo directorio WiredTiger y recuperó el usuario y la última actualización de la tarea. Las escrituras se confirman con `writeConcern` de mayoría y journal para que una parada brusca no pierda cambios ya reconocidos por la API; consulta [arquitectura](docs/ARQUITECTURA.md).

Evidencias reproducibles: [reporte JSON](docs/evidencias/verificacion.json), [TypeScript](docs/evidencias/typecheck.txt), [builds](docs/evidencias/build.txt) y [pruebas](docs/evidencias/test.txt). El entorno utilizado fue Node.js `22.22.2` y MongoDB `8.0.17`. El detalle y los límites de comprobación visual figuran en [AUDITORIA.md](docs/AUDITORIA.md).

Para inspeccionar los documentos reales de tu base configurada sin imprimir hashes:

```powershell
npm run db:inspect
```

Este comando es de lectura y utiliza `server/.env`. La evidencia de la ejecución realizada está en [07-mongodb-documentos.json](docs/evidencias/07-mongodb-documentos.json).

Además de la suite aislada, se reinició la instancia persistente de la aplicación en el puerto 27017 sobre el mismo directorio de datos. Las tres tareas de la cuenta académica conservaron todos sus campos, incluido el título editado y el estado completado; login, listado y salud respondieron `200` tras la reconexión. La comparación real antes/después está en [14-persistencia-aplicacion.json](docs/evidencias/14-persistencia-aplicacion.json).

Prueba manual recomendada:

1. Registra las cuentas A y B.
2. Crea una tarea con A y anota su identificador.
3. Con B, comprueba lista vacía y `404` al consultar, actualizar o eliminar ese identificador.
4. Cierra sesión, recarga y confirma que el dashboard exige acceso.
5. Reinicia API y MongoDB sin borrar `.local/mongodb`; inicia sesión con A y comprueba que la tarea continúa almacenada.
6. Verifica los documentos en MongoDB Compass y reúne capturas siguiendo la [guía de evidencias](docs/evidencias/README.md).

## 17. Evidencias y demostración académica

La carpeta [docs/evidencias](docs/evidencias/README.md) contiene capturas reales de registro, login, dashboard, creación, listado, confirmación de eliminación, API, rechazo sin token, validación y vista móvil. Incluye registros JSON reales de MongoDB y HTTP, y salidas de verificación automatizada. El [manifiesto](docs/evidencias/MANIFIESTO.md) distingue lo obtenido de lo pendiente. Los ejemplos JSON de este README son ilustrativos; no son evidencias de ejecución. Los registros y capturas públicos usan cuentas académicas sintéticas y omiten contraseñas, hashes y tokens.

**Inicio de sesión:**

![Pantalla real de inicio de sesión](docs/evidencias/02-login.jpg)

**Dashboard con tareas guardadas:**

![Dashboard real de TaskFlow](docs/evidencias/05-tareas-guardadas.jpg)

**Eliminación confirmada desde la interfaz:**

![Tarea temporal eliminada y listado actualizado](docs/evidencias/06b-tarea-eliminada.jpg)

El flujo de eliminación se comprobó de extremo a extremo: cancelar conservó la tarea; confirmar la eliminó, actualizó el listado y redujo el contador de cuatro a tres. La recarga mantuvo las tres tareas restantes.

Para completar una captura auténtica de MongoDB Compass, conecta la misma base usada por la aplicación y sigue la [guía detallada](docs/evidencias/README.md#completar-la-captura-mongodb). No se sustituye esa captura por una imagen generada.

Para preparar una exposición breve, sigue el [guion de demostración de tres minutos](docs/DEMO.md).

## 18. Solución de problemas frecuentes

| Problema | Comprobación y solución |
| --- | --- |
| `npm` o `node` no se reconocen | Instala Node.js compatible y abre una terminal nueva. |
| Error de descarga de dependencias | Comprueba conexión, proxy y permisos; vuelve a ejecutar `npm install`. No confundas una instalación fallida con una validación correcta. |
| MongoDB local no descarga | Revisa acceso a los servidores oficiales, antivirus y permisos del directorio; puedes instalar MongoDB Community manualmente y usar su URI. |
| Puerto 27017 ocupado | Usa tu servicio existente o detén sólo tu otro proceso de MongoDB; evita lanzar una segunda instancia sobre el mismo puerto/directorio. |
| Error de conexión MongoDB | Inicia la base, confirma la URI y revisa el mensaje del backend. En Atlas verifica usuario, permisos e IP autorizada. |
| `JWT_SECRET` inválido | Ejecuta la configuración local o define un secreto aleatorio de al menos 32 bytes en `server/.env`; reinicia el backend. |
| CORS rechazado | Abre exactamente `http://localhost:5173` o ajusta `CLIENT_ORIGIN` al origen real y reinicia. `127.0.0.1` y `localhost` son orígenes diferentes. |
| No se puede contactar con la API | Confirma el puerto 4000, `/api/health` y `VITE_API_URL`; reinicia Vite después de cambiar su entorno. |
| `401` al usar tareas | Inicia sesión otra vez; confirma el encabezado Bearer y la expiración del token. |
| Correo duplicado | Inicia sesión con la cuenta existente o usa otro correo de prueba. |
| Tarea ajena devuelve `404` | Es el comportamiento esperado de aislamiento entre cuentas. |
| Pruebas tardan en el primer intento | Espera a la descarga del binario MongoDB; revisa los errores antes de dar la suite por aprobada. |

## 19. Entrega y revisión de seguridad

Incluye código fuente, lockfile, `.env.example`, README, auditoría y evidencias reales. No entregues `node_modules`, builds, archivos `.env`, tokens, URI privada ni los datos de `.local/`. Comprueba `git status --short` y revisa los archivos que vas a añadir antes de crear un commit. Si una credencial se publica accidentalmente, elimínala del material y rótala; borrarla del último archivo no la elimina del historial.

La [revisión previa a la publicación](docs/evidencias/15-seguridad-publicacion.json) examinó el contenido del índice Git, sin coincidencias con el secreto JWT real, la contraseña de prueba privada ni los patrones de tokens o claves privadas comprobados. El informe registra fecha, cantidad de archivos, alcance y limitaciones; los ejemplos de este README son ficticios y los secretos locales permanecen excluidos.

## 20. Repositorio público de GitHub

Repositorio: **[Gonzofm/taskflow-fullstack-pa3](https://github.com/Gonzofm/taskflow-fullstack-pa3)**.

**Código publicado en la rama `main`.** La publicación inicial se verificó en el commit [`aba297b`](https://github.com/Gonzofm/taskflow-fullstack-pa3/commit/aba297bd8bfdabebb8d24d71ded82749207318c0): los 77 archivos y su árbol Git coincidieron exactamente con el contenido local revisado. El envío se completó mediante la API oficial de GitHub y actualizaciones de referencia sin `force`, debido a problemas de conexión del transporte Git HTTPS en el entorno de verificación. La rama `main` contiene la versión entregable y sus actualizaciones de documentación.

El [registro de publicación pública](docs/evidencias/16-publicacion-github.json), obtenido en `2026-11-02T20:09:55.568Z`, confirma tres respuestas `200` sin autenticación para repositorio, rama y árbol de archivos. Los hashes de los 77 archivos de esa instantánea inicial coinciden con Git local y no aparecen los archivos excluidos. Los commits posteriores de documentación pueden ampliar ese inventario; el registro conserva la instantánea original.

Puedes clonar e instalar el proyecto sin depender de las rutas del equipo de desarrollo:

```powershell
git clone https://github.com/Gonzofm/taskflow-fullstack-pa3.git
cd taskflow-fullstack-pa3
npm install
npm run setup
```

Después, inicia MongoDB y la aplicación siguiendo los apartados 8 y 10. GitHub publica el código y la documentación; los procesos de React, Express y MongoDB se ejecutan con la configuración local descrita.
