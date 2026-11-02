# Auditoría final — TaskFlow PA3

**Resultado: aplicación implementada, código publicado y verificación automatizada aprobada; 18/18 pruebas de integración con MongoDB real.** La calificación simulada es **20/20**, justificada por los cinco criterios de la rúbrica. Es una estimación académica; la nota final corresponde al docente.

Fecha de verificación: **2 de noviembre de 2026**, America/Lima. Ejecución automatizada de referencia: **`2026-11-02T19:53:58.552Z`** (14:53:58 en Lima). Entorno: Node.js **22.22.2**, MongoDB **8.0.17**, cliente Vite y API Express locales. El código está publicado en el [repositorio público](https://github.com/Gonzofm/taskflow-fullstack-pa3), rama `main`. La publicación inicial quedó comprobada en `2026-11-02T20:04:24.017Z` (15:04:24 en Lima), con 77 archivos y el mismo árbol Git que la versión local revisada. Compass no está instalado; su captura auténtica complementaria se explica en la guía.

## Matriz por criterio

| Criterio | Máximo | Funcionalidad implementada | Archivos que demuestran el cumplimiento | Pruebas ejecutadas y resultados | Problemas pendientes | Puntaje estimado |
| --- | ---: | --- | --- | --- | --- | ---: |
| Frontend React + TypeScript | 6 | Registro, login, rutas privadas, sesión, dashboard, indicadores, formularios controlados, CRUD, búsqueda/filtros, modales, notificaciones y responsive | [`App.tsx`](../client/src/App.tsx), [`AuthPage.tsx`](../client/src/pages/AuthPage.tsx), [`DashboardPage.tsx`](../client/src/pages/DashboardPage.tsx), [`components`](../client/src/components/), [`hooks`](../client/src/hooks/), [`context`](../client/src/context/), [`api.ts`](../client/src/services/api.ts) | TypeScript y build PASS; navegador: registro, creación, edición, completar/reabrir, búsqueda, filtros y recarga PASS; cancelación y confirmación de eliminación PASS, contador 4→3 y listado actualizado; logout y redirección privada PASS; login erróneo/válido PASS; viewports 390 y 320 px sin desbordamiento | Ningún bloqueo funcional observado | 6/6 |
| Backend Node.js + Express | 5 | API REST modular, todas las rutas requeridas, controladores, validación estricta, códigos HTTP y errores centrales | [`app.ts`](../server/src/app.ts), [`index.ts`](../server/src/index.ts), [`controllers`](../server/src/controllers/), [`routes`](../server/src/routes/), [`errors.ts`](../server/src/middlewares/errors.ts) | Compilación PASS; backend compilado inició en puerto 4000 y conectó MongoDB; suite real verifica CRUD y códigos HTTP; comprobación adicional confirma rechazo de JWT y aislamiento entre cuentas | Ningún bloqueo funcional observado | 5/5 |
| MongoDB + Mongoose | 4 | User y Task, validaciones, timestamps, correo único, índices, relación ObjectId y consultas por propietario; almacenamiento persistente WiredTiger y confirmación de escritura en journal | [`User.ts`](../server/src/models/User.ts), [`Task.ts`](../server/src/models/Task.ts), [`database.ts`](../server/src/config/database.ts), [`mongodb.mjs`](../scripts/mongodb.mjs), [`api.test.ts`](../server/tests/api.test.ts) | MongoDB real 8.0.17 conectado; reinicio real del proceso `mongod` sobre los mismos archivos preserva usuario y última actualización de la tarea; inspección directa de documentos reales | Captura visual en Compass pendiente; JSON real y guía disponibles | 4/4 |
| Autenticación y seguridad | 3 | bcrypt costo 12, JWT firmado y expiración, Bearer, validación de cuenta/propietario, CORS autorizado, rate limit, secretos sólo en entorno y respuestas sin hashes | [`authController.ts`](../server/src/controllers/authController.ts), [`auth.ts`](../server/src/middlewares/auth.ts), [`taskController.ts`](../server/src/controllers/taskController.ts), [`env.ts`](../server/src/config/env.ts), [`api.test.ts`](../server/tests/api.test.ts), [`.gitignore`](../.gitignore) | Hash bcrypt almacenado/comparable PASS; login/JWT PASS; tokens ausentes/incorrectos/expirados `401` PASS; origen ajeno `403` PASS; cuenta B recibe `404` al acceder/modificar/eliminar tarea A; inyección de propietario `400` PASS | Logout es local; JWT emitido vence naturalmente y no hay revocación/refresh token, alcance académico documentado | 3/3 |
| Entrega y documentación | 2 | README de 20 apartados, entorno de ejemplo, arquitectura, auditoría, guion de demo, capturas reales incluidas en README, registros HTTP/MongoDB y logs saneados; URL real de GitHub y código público | [`README.md`](../README.md), [`.env.example` servidor](../server/.env.example), [`.env.example` cliente](../client/.env.example), [`MANIFIESTO.md`](evidencias/MANIFIESTO.md), [`DEMO.md`](DEMO.md) | Enlaces y comandos contrastados con implementación; evidencias reales inventariadas; instalación completó 310 paquetes y código 0; publicación inicial verificada por coincidencia exacta del árbol Git; sin rutas absolutas del equipo | Captura Compass complementaria si el docente la solicita; guía auténtica incluida | 2/2 |
| **Total** | **20** | **Cumplimiento implementado y verificado de los cinco criterios** | | **18/18 pruebas automatizadas aprobadas y código publicado** | **Compartir URL con el docente; completar captura Compass si la solicita** | **20/20 simulado** |

## Registro reproducible de ejecución

El comando `npm run verify` ejecutó nuevamente `typecheck`, `build` y `test` y terminó con **código 0**. Las salidas se guardaron automáticamente con rutas del equipo saneadas; pueden regenerarse repitiendo el mismo comando. Antes de esta ejecución se corrigió la confirmación durable de escritura descrita abajo.

| Comprobación | Resultado observado | Evidencia |
| --- | --- | --- |
| Instalación de dependencias | `npm install` completó 310 paquetes, código 0 | Instalación ejecutada en el entorno; dependencias fijadas en `package-lock.json` |
| TypeScript cliente y servidor | Correcto, código 0 | [`typecheck.txt`](evidencias/typecheck.txt) |
| Build cliente y servidor | Correcto, código 0 | [`build.txt`](evidencias/build.txt) |
| Build final del cliente tras ajustes visuales | Correcto, código 0; incluye la corrección de ancho móvil y singular de filtros | [`build-client-final.txt`](evidencias/build-client-final.txt) |
| Inicio final del cliente | Vite inició en 609 ms en `http://localhost:5173/`, coincidiendo con CLIENT_ORIGIN | Observación directa de `npm run dev -w @taskflow/client` |
| Integración API + MongoDB real | **18 aprobadas / 18**, código 0 | [`test.txt`](evidencias/test.txt) |
| Resumen de ejecución | Tres comprobaciones con `exitCode: 0`; Node 22.22.2 | [`verificacion.json`](evidencias/verificacion.json) |
| Inicio del backend compilado | Escuchó en `http://localhost:4000`; MongoDB conectado | [`08-api-salud.jpg`](evidencias/08-api-salud.jpg), [`08-api-http.json`](evidencias/08-api-http.json) |
| Conexión MongoDB persistente | Base `taskflow`, documentos reales de una cuenta académica sintética; sin hashes en evidencia | [`07-mongodb-documentos.json`](evidencias/07-mongodb-documentos.json) |
| Hash de contraseña | bcrypt costo 12; coincide con contraseña por `bcrypt.compare`; no se devuelve | Caso de registro en [`api.test.ts`](../server/tests/api.test.ts), [`test.txt`](evidencias/test.txt) |
| Login y JWT válido | Login `200`; JWT verificado y `/auth/me` aceptado | Suite e [`08-api-http.json`](evidencias/08-api-http.json), token omitido |
| Token ausente, inválido y expirado | `401` en los tres escenarios | Suite y [`09-protegido-sin-token.jpg`](evidencias/09-protegido-sin-token.jpg) |
| Aislamiento entre cuentas | Lista B vacía; GET/PUT/DELETE de tarea A con token B devuelven `404`; propietario inmutable | Suite, casos de aislamiento y asignación de propietario |
| CRUD completo | Crear `201`, listar/consultar/actualizar/eliminar `200`, repetición `404` | Suite y eliminación desde UI en [`06-confirmacion-eliminar.jpg`](evidencias/06-confirmacion-eliminar.jpg), [`06b-tarea-eliminada.jpg`](evidencias/06b-tarea-eliminada.jpg) |
| Persistencia tras reiniciar MongoDB | Nuevo proceso `mongod`, mismo directorio WiredTiger, última actualización y usuarios recuperados; prueba original sin relajar | Caso «persiste después de reiniciar…» en [`api.test.ts`](../server/tests/api.test.ts) y log aprobado |
| Persistencia en la base de la aplicación | Cierre limpio y reinicio del puerto 27017; PID 23364→28284; las tres tareas conservaron exactamente todos sus campos; login/listado/salud `200` | [`14-persistencia-aplicacion.json`](evidencias/14-persistencia-aplicacion.json) |
| Seguridad antes de publicar | Contenido del índice revisado; sin coincidencias con secretos reales, tokens, claves privadas, credenciales MongoDB ni rutas personales según las comprobaciones documentadas | [`15-seguridad-publicacion.json`](evidencias/15-seguridad-publicacion.json), que registra fecha, cantidad y alcance |
| CORS y límites | Origen autorizado/preflight aceptados, ajeno `403`; exceso de intentos `429` | Suite |
| UI escritorio | Registro y validación, creación de 3 tareas, edición, completar/reabrir, búsqueda, prioridades, estados y recarga comprobados; logout protege acceso directo; error de login y login válido comprobados | Capturas 01–06 y 11 del [manifiesto](evidencias/MANIFIESTO.md), [`13-verificacion-navegador.json`](evidencias/13-verificacion-navegador.json) |
| UI móvil | 390 y 320 px, sin desbordamiento horizontal; a 390 px entradas de 16 px; problema de ancho mínimo a 320 px corregido y comprobado | [`12-dashboard-movil.jpg`](evidencias/12-dashboard-movil.jpg) (320 px), [`13-verificacion-navegador.json`](evidencias/13-verificacion-navegador.json) |
| Consola navegador | Sin errores ni advertencias en revisión previa a provocar credenciales incorrectas; el `401` posterior es esperado | Observación directa registrada en [`13-verificacion-navegador.json`](evidencias/13-verificacion-navegador.json) |
| Confirmación de eliminación UI | Cancelar conservó la tarea; confirmar eliminó la tarea temporal, actualizó listado y contador 4→3; recarga conservó las 3 restantes | [`06-confirmacion-eliminar.jpg`](evidencias/06-confirmacion-eliminar.jpg), [`06b-tarea-eliminada.jpg`](evidencias/06b-tarea-eliminada.jpg) |
| Captura de Compass | Pendiente: no instalado; inspección real por script sí ejecutada | JSON de documentos; pasos en guía |
| Repositorio público GitHub | Código publicado en `main`; publicación inicial de 77 archivos con árbol remoto idéntico al local, sin `force`; repositorio, rama y árbol responden `200` a GET sin token | [Gonzofm/taskflow-fullstack-pa3](https://github.com/Gonzofm/taskflow-fullstack-pa3), [commit inicial publicado](https://github.com/Gonzofm/taskflow-fullstack-pa3/commit/aba297bd8bfdabebb8d24d71ded82749207318c0), [`16-publicacion-github.json`](evidencias/16-publicacion-github.json) |

## Alcance de las evidencias

Los JPG son capturas de la aplicación ejecutándose. Los JSON de MongoDB y HTTP contienen resultados reales saneados; se omitieron tokens y hashes. Ninguna imagen fue generada para representar un funcionamiento no observado. Los ejemplos de solicitudes y respuestas del README están identificados como ejemplos.

El registro de publicación corresponde a la instantánea inicial comprobada en `2026-11-02T20:09:55.568Z`: los tres GET fueron anónimos, con verificación del certificado HTTPS, y devolvieron `200`. Su SHA identifica el commit inicial publicado; los commits posteriores de documentación y evidencias pueden ampliar el inventario sin invalidar esa comparación.

La prueba automatizada de persistencia reinició un proceso real de MongoDB; la recarga del navegador es una comprobación adicional independiente. No se confunde una recarga con un reinicio de base de datos.

La operación de eliminación se verificó contra la API por Supertest y mediante el botón final de la interfaz. Se creó una tarea descartable exclusivamente para esa comprobación; cancelar la conservó y confirmar la eliminó. El listado y los indicadores se actualizaron, y la tarea no reapareció al recargar.

## Corrección comprobada de durabilidad

La repetición de la suite detectó que un cierre brusco del proceso standalone en Windows podía perder la última actualización reconocida por la API. Se configuró `writeConcern: { w: 'majority', journal: true, wtimeoutMS: 10000 }` en la conexión de Mongoose. La confirmación ahora exige registrar la escritura en el journal. La prueba de reinicio original se mantuvo y el nuevo `npm run verify` aprobó los 18 casos, sin añadir pausas ni reducir sus condiciones. El fallo previo no se presenta como aprobado ni sustituye el reporte final.

## Cierre de entrega

1. Compartir con el docente la [URL pública definitiva](https://github.com/Gonzofm/taskflow-fullstack-pa3) y seguir las instrucciones de clonación del README.
2. Si se requiere la vista de Compass, abrir la herramienta, conectar a la misma base y capturar documentos de tareas sin datos privados, siguiendo la [guía](evidencias/README.md#completar-la-captura-mongodb).
3. Revisar el [manifiesto](evidencias/MANIFIESTO.md) y seguir el [guion de demo](DEMO.md).

La calificación simulada de 20/20 reconoce frontend, API modular, Mongoose y persistencia real, seguridad comprobada, documentación reproducible y publicación del código. La captura complementaria de Compass no se fabrica: se entrega una guía para obtenerla y se conservan los JSON auténticos y las pruebas reales de persistencia. El docente determina la nota final.

Los documentos locales permanecen en `.local/mongodb`, excluido de Git. Para abrir la aplicación ejecuta `npm run db:start` y, en otra terminal, `npm run dev`.
