# Manifiesto de evidencias obtenidas

Fecha: **2 de noviembre de 2026**, America/Lima. Entorno local académico con Node.js **22.22.2**, MongoDB **8.0.17**, API en `localhost:4000` y cliente en `localhost:5173`. La última verificación automatizada comenzó en `2026-11-02T19:20:47.285Z` y aprobó TypeScript, ambos builds y las 18 pruebas.

Las capturas de interfaz se obtuvieron mediante automatización del navegador sobre la aplicación real. Los datos de demostración se crearon mediante formularios reales; no son datos precargados del producto. El registro público de HTTP omite tokens, y la consulta de MongoDB excluye hashes de contraseñas.

| Archivo | Procedencia | Alcance |
| --- | --- | --- |
| [01-registro.jpg](01-registro.jpg) | Captura del navegador | Pantalla de registro |
| [02-login.jpg](02-login.jpg) | Captura del navegador | Pantalla de acceso |
| [03-dashboard-vacio.jpg](03-dashboard-vacio.jpg) | Captura del navegador tras crear cuenta | Dashboard privado y estado vacío |
| [04-crear-tarea.jpg](04-crear-tarea.jpg) | Captura del navegador | Formulario real de tarea |
| [05-tareas-guardadas.jpg](05-tareas-guardadas.jpg) | Captura del navegador | Tres tareas guardadas en MongoDB; una completada |
| [06-confirmacion-eliminar.jpg](06-confirmacion-eliminar.jpg) | Captura del navegador | Modal real abierto para una tarea temporal; cancelar la conservó |
| [06b-tarea-eliminada.jpg](06b-tarea-eliminada.jpg) | Captura del navegador después de confirmar Eliminar tarea | Tarea descartable eliminada, listado actualizado, contador de 4 a 3 y mensaje de éxito |
| [07-mongodb-documentos.json](07-mongodb-documentos.json) | Consulta directa mediante script de inspección | Documentos reales de una cuenta de prueba y sus tareas; campo `password` excluido |
| [08-api-http.json](08-api-http.json) | Peticiones HTTP al backend activo | Salud `200`, protegido `401`, login `200`, eliminación `200`, consulta posterior `404`, listado `200`; token omitido |
| [08-api-salud.jpg](08-api-salud.jpg) | Captura de respuesta real en navegador | API y conexión MongoDB disponibles |
| [09-protegido-sin-token.jpg](09-protegido-sin-token.jpg) | Captura de respuesta real en navegador | Ruta protegida sin token, error de acceso |
| [11-validaciones.jpg](11-validaciones.jpg) | Captura del navegador | Validación real del formulario de registro |
| [12-dashboard-movil.jpg](12-dashboard-movil.jpg) | Captura del navegador a 320 px | Distribución responsive; sin desbordamiento |
| [13-verificacion-navegador.json](13-verificacion-navegador.json) | Registro de observaciones del navegador CUA | Flujos UI, logout, protección privada, login, tamaños 390/320 px y alcance de consola |
| [typecheck.txt](typecheck.txt) | Salida automática de `npm run verify` | TypeScript cliente y servidor: código 0 |
| [build.txt](build.txt) | Salida automática de `npm run verify` | Vite y compilación backend: código 0 |
| [build-client-final.txt](build-client-final.txt) | Build adicional después del ajuste móvil y del texto singular de filtros | TypeScript y Vite finales: código 0 |
| [test.txt](test.txt) | Salida automática de `npm run verify` | 18/18 pruebas con un proceso MongoDB real |
| [verificacion.json](verificacion.json) | Resumen generado por `scripts/verify.mjs` | Comandos, códigos de salida, duración y entorno; los tres códigos son 0 |

Los JSON y logs conservan sus timestamps originales para identificar la hora exacta de cada ejecución. Las fechas ISO con sufijo `Z` están expresadas en UTC; para America/Lima se restan cinco horas. Regenerar `npm run verify` actualiza los logs y su reporte, no las capturas ni el registro HTTP.

## Comprobaciones observadas sin captura separada

En el navegador se comprobaron registro válido, validación de campos, creación de tareas, edición, completar/reabrir, búsqueda por texto, filtros por prioridad/estado y recarga que conserva las tareas. Tras cerrar sesión, el acceso directo a `/dashboard` redirigió a login; unas credenciales incorrectas produjeron un error claro y el login válido recuperó los documentos de la cuenta. Las capturas renovadas utilizan la cuenta sintética genérica «Estudiante PA3».

La revisión inicial de consola no mostró errores ni advertencias; posteriormente la prueba deliberada de login incorrecto generó el `401` esperado. Se comprobaron 390 px y 320 px sin desbordamiento horizontal. A 320 px, tras corregir el ancho mínimo, `clientWidth` y `scrollWidth` coincidieron en 305 px. Las observaciones completas están en [13-verificacion-navegador.json](13-verificacion-navegador.json).

La eliminación efectiva se verificó mediante HTTP, pruebas automatizadas y el botón final de confirmación en UI. Una tarea descartable creada para la prueba se conservó al cancelar; al confirmar su eliminación desapareció del listado, el contador bajó de cuatro a tres y se mostró un mensaje de éxito. La recarga conservó las tres tareas restantes.

La repetición de la suite encontró y permitió corregir la durabilidad de la última escritura ante una terminación brusca de MongoDB en Windows. La conexión ahora exige `writeConcern` de mayoría con journal y la prueba original de reinicio pasó sin relajarse. Los logs finales corresponden a la ejecución posterior a la corrección; los logs públicos omiten la ruta del equipo.

## Pendientes identificados

- `07-mongodb-documentos.jpg`: captura de MongoDB Compass, que no está instalado. Existe JSON real de la base y una prueba real de reinicio/persistencia.
- `10-github.jpg`: el [repositorio público](https://github.com/Gonzofm/taskflow-fullstack-pa3) ya fue creado y su visibilidad comprobada; el envío inicial del código está en preparación. La captura se obtendrá después de verificar el push y los archivos remotos.

Para reproducir y completar las evidencias sigue [README.md](README.md). La evaluación y el alcance de las pruebas figuran en [AUDITORIA.md](../AUDITORIA.md).
