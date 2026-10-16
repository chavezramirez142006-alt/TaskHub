# SENATI TaskHub PWA · PROYECTO 2 (PROYECTO INDIVIDUAL)

**Escuela de Tecnologías de la Información**  
**Taller PWA – App Manifest, Service Worker & IndexedDB**  
**Instructor:** Jorge Luque Chambi  

---

## 📌 DESCRIPCIÓN DEL PROYECTO
SENATI TaskHub PWA es una Aplicación Web Progresiva completa para la gestión y entrega de asignaciones académicas técnicas en entornos de baja o nula conectividad.

### Funcionalidades Obligatorias Cumplidas:
- **TH-01:** Lista de tareas académicas con búsqueda por título y filtro por curso combinables.
- **TH-02:** Formulario de entrega validado: selección obligatoria de tarea y comentario de entrega no vacío con alertas específicas.
- **TH-03 y TH-04:** Persistencia en **IndexedDB (`SENATITaskHubDB` > `entregas`)** con fecha de registro, comentario, tarea relacionada y estado inicial **`PENDIENTE`**.
- **TH-05:** Bandeja *"Mis entregas locales"* con contador de pendientes derivado directamente de la consulta por índice en la base de datos.
- **TH-06:** Control honesto de sincronización (*"Online no significa sincronizado"*): muestra el mensaje oficial *"Con conexión: listo para intentar sincronizar"* manteniendo el estado `PENDIENTE` ante la ausencia de una API empresarial remota.
- **TH-07:** Eliminación confirmada mediante modal interactivo (*"Cancelar conserva; confirmar elimina"*).
- **TH-08:** Manejo y reporte explícito de errores de IndexedDB para garantizar la integridad de los datos.

---

## 🚀 COMANDOS DE EJECUCIÓN

### 1. Iniciar Servidor de Desarrollo
```bash
npx ng serve
```
Acceso: `http://localhost:4200` (o el puerto asignado).

### 2. Compilar para Producción con Service Worker
```bash
npx ng build --configuration production
```
Genera los archivos optimizados con el Service Worker en `dist/senati-taskhub-pwa/browser`.

### 3. Servir en Localhost
```bash
npx http-server dist/senati-taskhub-pwa/browser -p 8081 -c-1
```
Acceso: `http://localhost:8081`

---

## 💡 PREGUNTAS DE REFLEXIÓN (SECCIÓN I DEL PDF)

1. **¿Por qué una entrega debe persistir tras recargar el navegador?**  
   Porque en situaciones de intermitencia de red, recarga accidental o cierre de pestañas, la memoria RAM volátil se destruye. Persistir en IndexedDB garantiza que el trabajo y comentarios del estudiante queden asegurados de forma permanente en el cliente.

2. **¿Qué campos relacionan la entrega con su tarea?**  
   La clave foránea principal es `tareaId: number`. Se acompañan los campos `curso` y `tituloTarea` como redundancia deliberada para optimizar la carga inmediata en la bandeja sin necesidad de consultar el catálogo.

3. **¿Qué riesgo hay al reintentar sincronizar varias veces?**  
   Riesgo de generar registros duplicados en el servidor en caso de pérdidas de paquetes de respuesta (*ACK*), saturación de infraestructura del instituto (*DoS involuntario*) y conflictos de versiones sobre entregas previas.

4. **¿Qué validaciones debe repetir el servidor al integrar una API?**  
   Principio de *Zero Trust*: verificar vigencia y fecha límite de la tarea, autorización y matrícula del alumno en el curso, integridad y formato de archivos adjuntos, longitud máxima y evitar duplicados.
