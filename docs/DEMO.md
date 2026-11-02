# Demostración de TaskFlow en tres minutos

## Preparación

Con las dependencias y el entorno configurados, ejecuta `npm run db:start` en una terminal y `npm run dev` en otra. Abre `http://localhost:5173`. Ten disponibles [el reporte de pruebas](evidencias/test.txt), [los documentos de MongoDB](evidencias/07-mongodb-documentos.json) y [la auditoría](AUDITORIA.md). Usa una cuenta de prueba y evita mostrar contraseñas, JWT o la URI privada de Atlas.

## Guion

| Tiempo | Acción | Explicación breve |
| --- | --- | --- |
| 0:00–0:25 | Mostrar registro y enviar campos inválidos; después crear una cuenta de prueba o entrar con la existente | «React valida el formulario y el servidor vuelve a validar todos los datos. El correo se normaliza y la contraseña se almacena como hash bcrypt.» |
| 0:25–0:45 | Mostrar dashboard e indicadores | «Esta ruta es privada. La API verifica el JWT; cada consulta de tareas filtra por el identificador del usuario autenticado.» |
| 0:45–1:20 | Crear una tarea con descripción y prioridad alta, editarla y marcarla como completada | «Cada acción consume la API REST real. React actualiza el estado con la respuesta del servidor y actualiza los indicadores.» |
| 1:20–1:40 | Buscar la tarea y cambiar un filtro; recargar la página | «Los filtros facilitan la consulta. Al recargar, los datos siguen disponibles porque están en MongoDB, no en localStorage.» |
| 1:40–2:00 | Crear o elegir una tarea descartable, abrir el modal, cancelar para conservarla y volver a abrirlo para confirmar; mostrar el contador y listado actualizados | «La eliminación requiere confirmación y el backend comprueba de nuevo al propietario. Este flujo completo ya fue verificado desde la interfaz.» |
| 2:00–2:25 | Mostrar la respuesta de `/api/tasks` sin token y el log de las pruebas | «Sin Bearer, la API responde 401. La suite también demuestra que la cuenta B recibe 404 al intentar consultar, modificar o eliminar una tarea de A.» |
| 2:25–2:45 | Mostrar documentos MongoDB y el caso de persistencia aprobado | «User y Task se relacionan mediante ObjectId. La escritura se confirma en el journal. La prueba reinicia un proceso mongod real sobre los mismos archivos WiredTiger y recupera la última actualización.» |
| 2:45–3:00 | Mostrar estructura, README y cerrar sesión | «Frontend y backend son workspaces separados. TypeScript, ambos builds y las 18 pruebas pasaron. El README explica cómo reproducirlo.» |

El código está publicado en el [repositorio público de GitHub](https://github.com/Gonzofm/taskflow-fullstack-pa3), rama `main`. Para la exposición, abre su README y las carpetas `client`, `server` y `docs`; el [registro de publicación](evidencias/16-publicacion-github.json) demuestra acceso anónimo mediante tres GET con respuesta `200`. La captura de Compass es un complemento manual; hasta obtenerla, presenta el JSON de inspección y la comparación antes/después del reinicio como evidencias de consultas reales. El [manifiesto](evidencias/MANIFIESTO.md) contiene las capturas reales de la confirmación y del resultado de eliminación.

## Si el docente pregunta

- **¿Dónde se guarda el token?** En `sessionStorage` de la pestaña, con expiración de una hora. El cierre de sesión limpia el token local; no revoca uno ya emitido antes de su vencimiento.
- **¿Puede enviarse el id de otro usuario al crear una tarea?** No. El cuerpo se valida estrictamente y `user` se asigna desde la identidad verificada.
- **¿Cómo se protegen tareas ajenas?** Cada consulta individual combina `_id` y `user`. No basta con ocultar botones en React.
- **¿La base de pruebas es simulada?** No. El lanzador ejecuta un binario MongoDB real. La aplicación usa una instancia persistente; las pruebas utilizan otra base aislada y temporal.
- **¿Por qué se configura el journal?** Para confirmar una escritura cuando queda registrada de forma durable. Se corrigió una posible pérdida del último cambio al terminar bruscamente el proceso en Windows y se repitió la prueba de reinicio sin debilitarla.
- **¿Qué falta para la entrega?** Compartir la URL pública con el docente y, si solicita la vista de Compass, completar esa captura auténtica siguiendo la guía. El código, los resultados de pruebas y las evidencias de funcionamiento ya están preparados.
