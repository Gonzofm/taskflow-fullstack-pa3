# Evidencias reales y guía de capturas

Esta carpeta contiene capturas reales de la aplicación ejecutándose, documentos consultados en MongoDB, resultados HTTP saneados y logs de verificación. El inventario exacto y sus límites están en [MANIFIESTO.md](MANIFIESTO.md). Fecha de obtención: **2 de noviembre de 2026**, America/Lima.

**Verificación automatizada renovada: 18/18 pruebas aprobadas, TypeScript y builds correctos**, con inicio `2026-11-02T19:53:58.552Z`. Consulta [verificacion.json](verificacion.json), [typecheck.txt](typecheck.txt), [build.txt](build.txt) y [test.txt](test.txt). Para regenerarlos, ejecuta `npm run verify` desde la raíz. La última actualización de una tarea se recuperó después de reiniciar el proceso MongoDB; las escrituras se confirman en el journal.

## Diez evidencias solicitadas

| N.º | Evidencia disponible | Procedimiento real o paso pendiente | Qué demuestra |
| --- | --- | --- | --- |
| 1 | [01-registro.jpg](01-registro.jpg) | Captura de Crear cuenta; las validaciones también están en [11-validaciones.jpg](11-validaciones.jpg) | Nombre, correo, contraseña, navegación y validación |
| 2 | [02-login.jpg](02-login.jpg) | Pantalla real de Iniciar sesión | Formulario y diseño de acceso |
| 3 | [03-dashboard-vacio.jpg](03-dashboard-vacio.jpg) | Dashboard después del registro real | Acceso privado, nombre, indicadores y lista vacía |
| 4 | [04-crear-tarea.jpg](04-crear-tarea.jpg) | Modal de creación abierto en la aplicación | Título, descripción, prioridad y estado |
| 5 | [05-tareas-guardadas.jpg](05-tareas-guardadas.jpg) | Tres tareas creadas mediante UI y recuperadas tras recargar | Listado real, prioridades, estados e indicadores |
| 6 | [06-confirmacion-eliminar.jpg](06-confirmacion-eliminar.jpg), [06b-tarea-eliminada.jpg](06b-tarea-eliminada.jpg) y [08-api-http.json](08-api-http.json) | Cancelar conservó una tarea temporal; confirmar Eliminar tarea la eliminó, actualizó el listado y redujo el contador 4→3; recarga conservó las 3 restantes | Confirmación y eliminación verificadas de extremo a extremo en UI, además de la API |
| 7 | [07-mongodb-documentos.json](07-mongodb-documentos.json) | Inspección directa de la base `taskflow`, sin hashes. **Captura Compass pendiente**: no está instalado | Documentos reales de una cuenta académica y sus tareas, relación ObjectId |
| 8 | [08-api-http.json](08-api-http.json) y [08-api-salud.jpg](08-api-salud.jpg) | Solicitudes reales al servidor ejecutándose; JWT omitido del registro entregable | API conectada, login/listado, JWT rechazados y GET/PUT/DELETE de tareas ajenas rechazados; recuperación tras reiniciar MongoDB |
| 9 | [09-protegido-sin-token.jpg](09-protegido-sin-token.jpg) | GET `/api/tasks` sin Authorization | Rechazo `401` y error JSON controlado |
| 10 | [Repositorio público con código publicado](https://github.com/Gonzofm/taskflow-fullstack-pa3) y [16-publicacion-github.json](16-publicacion-github.json); captura `10-github.jpg` complementaria | Tres GET anónimos devuelven `200`; 77 archivos de la instantánea inicial y árbol Git coinciden con el contenido local revisado, rama `main`, sin actualización forzada | Código fuente y documentación disponibles públicamente sin iniciar sesión |

Captura adicional: [12-dashboard-movil.jpg](12-dashboard-movil.jpg), navegador con viewport móvil de 320 px. Se comprobaron 390 y 320 px sin desbordamiento horizontal. El registro [13-verificacion-navegador.json](13-verificacion-navegador.json) documenta los flujos observados, logout, acceso privado y login. La consola no mostró errores ni advertencias antes de la prueba deliberada de credenciales incorrectas; el `401` posterior es esperado.

La [comparación de persistencia de la aplicación](14-persistencia-aplicacion.json) demuestra un nuevo proceso MongoDB en el mismo puerto y disco con las tres tareas intactas. La [auditoría previa a publicar](15-seguridad-publicacion.json) registra las exclusiones, el escaneo del índice Git y su cantidad de archivos, sin revelar credenciales.

## Captura auténtica de GitHub

La publicación del código ya está verificada en [16-publicacion-github.json](16-publicacion-github.json). Para añadir su captura visual complementaria:

1. Abre [Gonzofm/taskflow-fullstack-pa3](https://github.com/Gonzofm/taskflow-fullstack-pa3) en una ventana sin sesión o de incógnito.
2. Comprueba la visibilidad **Public**, la rama **main** y las carpetas **client**, **server** y **docs**; desplázate si hace falta para incluir el README.
3. Captura la página real con su URL visible, sin diálogos de credenciales, y guarda `10-github.jpg` en esta carpeta. No presentes una recreación o un mockup como captura del repositorio.

## Completar la captura MongoDB

Compass no está instalado en el entorno usado para estas verificaciones. La inspección JSON y el test de persistencia ya son reales; la siguiente captura debe obtenerse en Compass, sin recrearla con un editor de imágenes.

1. Abre MongoDB Compass en el equipo de exposición.
2. Mantén activos MongoDB (`npm run db:start`) y la aplicación (`npm run dev`). Crea una tarea de prueba si la lista está vacía.
3. Conecta a `mongodb://127.0.0.1:27017/taskflow`. Si usas Atlas, utiliza la URI privada localmente y evita capturar sus credenciales.
4. Abre la base **taskflow** y la colección **tasks**. Localiza por título una tarea creada desde la aplicación.
5. Muestra en el mismo documento `_id`, `title`, `description`, `priority`, `status`, `user`, `createdAt` y `updatedAt`. El campo `user` debe ser un ObjectId real asociado a la cuenta de prueba.
6. Captura la ventana de Compass con nombre de base, colección y documento visibles. Guarda **`07-mongodb-documentos.jpg`** en esta carpeta.
7. Comprueba antes de publicar que no aparezcan contraseñas, hashes, tokens, URI privada ni documentos de cuentas personales. Para esta captura basta la colección **tasks**; no necesitas abrir los hashes de **users**.

La inspección por terminal ya está disponible y es de lectura:

```powershell
npm run db:inspect
```

## Reproducir la eliminación verificada mediante UI

1. Crea una tarea temporal titulada «Prueba de eliminación».
2. Abre el modal, captura si lo necesitas y pulsa **Eliminar tarea**.
3. Comprueba que desaparece y que el indicador disminuye.
4. Recarga y confirma que no vuelve a aparecer; guarda `06b-tarea-eliminada.jpg`.

Este procedimiento ya se ejecutó con una tarea descartable durante la verificación. Las capturas del modal y del resultado están enlazadas en la fila 6; no es una funcionalidad pendiente.

## Capturar códigos HTTP sin exponer secretos

El endpoint sin token puede capturarse directamente:

```powershell
curl.exe -i http://localhost:4000/api/tasks
```

Para una petición autenticada, usa la variable `$headers` creada en el README. No imprimas `$headers`, `$token` ni el objeto completo de login en la captura:

```powershell
$respuesta = Invoke-WebRequest -Method Get -Uri 'http://localhost:4000/api/tasks' -Headers $headers
$respuesta.StatusCode
$respuesta.Content
```

Para verificar hashes, utiliza la prueba automatizada y su resultado. Si inspeccionas usuarios en Compass, oculta el campo `password`; no publiques hashes completos.

## Integridad de las evidencias

Los archivos JPG proceden de una ejecución real. Los JSON proceden de consultas reales con secretos omitidos. No se usaron mockups, imágenes generadas o respuestas inventadas como evidencia. La guía y el manifiesto distinguen la evidencia obtenida de los pasos aún pendientes. La calificación final corresponde al docente.
