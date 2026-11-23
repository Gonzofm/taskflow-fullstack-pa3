SET NAMES utf8mb4;

INSERT INTO integrantes (id,nombre,cargo,descripcion,imagen,especialidad) VALUES
(1,'Ana Torres','Coordinadora de productividad','Ayuda al equipo a convertir sus objetivos en planes semanales claros y alcanzables.','/images/team/ana.jpg','Planificación y objetivos'),
(2,'Diego Ramos','Gestor de proyectos','Organiza los entregables del equipo y acompaña el avance de cada proyecto.','/images/team/diego.jpg','Gestión de proyectos'),
(3,'Lucía Mendoza','Diseñadora de experiencias','Diseña herramientas sencillas para que organizar el trabajo resulte más fácil.','/images/team/lucia.jpg','Diseño centrado en las personas'),
(4,'Marco Salazar','Especialista en procesos','Busca oportunidades para reducir pasos repetitivos y mejorar los flujos de trabajo.','/images/team/marco.jpg','Mejora de procesos'),
(5,'Sofía Vargas','Facilitadora de aprendizaje','Propone técnicas de estudio y recursos para aprender con mayor constancia.','/images/team/sofia.jpg','Aprendizaje y hábitos'),
(6,'Andrés Castillo','Analista de objetivos','Da seguimiento a los avances y ayuda a priorizar las siguientes acciones del equipo.','/images/team/andres.jpg','Seguimiento y prioridades')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO categorias (id,nombre,descripcion,imagen) VALUES
(1,'Organización personal','Ordena tu día, construye hábitos y reserva tiempo para lo que te importa.','/images/categories/organization.svg'),
(2,'Productividad laboral','Coordina proyectos, reuniones y prioridades con un plan de trabajo compartido.','/images/categories/work.svg'),
(3,'Estudios y aprendizaje','Planifica tus sesiones de estudio y transforma tus recursos en aprendizaje.','/images/categories/study.svg')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO plantillas (id,categoria_id,nombre,descripcion,imagen,dificultad,estado) VALUES
(1,1,'Plan semanal','Distribuye tus actividades por día, identifica tus tres prioridades y reserva espacios de descanso.','/images/templates/plan-semanal.svg','Básica','Disponible'),
(2,1,'Seguimiento de hábitos','Registra pequeños hábitos diarios y observa tu constancia durante el mes.','/images/templates/habitos.svg','Básica','Disponible'),
(3,1,'Metas personales','Define una meta, divídela en acciones concretas y revisa tus avances cada semana.','/images/templates/metas-personales.svg','Intermedia','Disponible'),
(4,1,'Agenda diaria','Organiza tus pendientes en bloques de tiempo y cierra el día con una breve revisión.','/images/templates/agenda-diaria.svg','Básica','Disponible'),
(5,2,'Plan de proyecto','Organiza los entregables de un proyecto, asigna responsables y registra los bloqueos del equipo.','/images/templates/proyecto.svg','Intermedia','Disponible'),
(6,2,'Matriz de prioridades','Ordena tus tareas según su importancia y urgencia para decidir en qué concentrarte primero.','/images/templates/prioridades.svg','Básica','Disponible'),
(7,2,'Reuniones efectivas','Prepara una agenda, registra acuerdos y asigna las siguientes acciones con responsables.','/images/templates/reuniones.svg','Básica','Disponible'),
(8,2,'Objetivos del equipo','Relaciona objetivos de trabajo con resultados medibles y realiza revisiones periódicas.','/images/templates/objetivos-equipo.svg','Avanzada','Disponible'),
(9,3,'Plan de estudio','Distribuye materias y sesiones de repaso antes de una evaluación o nuevo aprendizaje.','/images/templates/plan-estudio.svg','Básica','Disponible'),
(10,3,'Registro de lecturas','Organiza tus lecturas, conserva ideas importantes y formula preguntas para profundizar.','/images/templates/lecturas.svg','Básica','Disponible'),
(11,3,'Repasos espaciados','Divide el temario en sesiones, practica preguntas y registra los temas que requieren refuerzo.','/images/templates/repasos.svg','Intermedia','Disponible'),
(12,3,'Control de entregas','Planifica tus trabajos con etapas, recursos y fechas de revisión para llegar a cada entrega.','/images/templates/entregas.svg','Intermedia','Disponible')
ON DUPLICATE KEY UPDATE id=id;
