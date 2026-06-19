# GlucoEasy

GlucoEasy es un servicio mínimo de monitorización de glucosa que puedes desplegar gratis en Cloudflare.

Nace para resolver un problema muy concreto: Nightscout completo puede ser más difícil de desplegar, más caro de mantener y más amplio de lo que mucha gente necesita en el día a día.

GlucoEasy se queda con lo esencial:

- recibir lecturas de glucosa desde `xDrip+`
- recibir tratamientos como bolos
- exponer una API compatible con Nightscout desde el primer día
- seguir siendo compatible con apps y herramientas que ya hablan con Nightscout

Version in English: see [README.md](README.md).  
Guía técnica: ver [README.technical.es.md](README.technical.es.md).

## En Una Frase

GlucoEasy es una forma simple de mantener compatibilidad con apps que soportan Nightscout para glucosa y bolos, sin la complejidad habitual de despliegue.

## Advertencia Importante

- No es un dispositivo médico.
- No debe usarse para dosificación ni decisiones de tratamiento.
- Úsalo solo como respaldo, recuperación o capa ligera de compatibilidad.

## Para Quién Es

Este proyecto es para ti si:

- ya usas `xDrip+`
- quieres un despliegue gratis en la nube
- buscas una alternativa más simple que una instalación completa de Nightscout
- necesitas compatibilidad con apps del ecosistema Nightscout como `Zukkah`
- sobre todo te importan las lecturas de glucosa, los bolos y la compatibilidad amplia

## Qué Hace

- Recibe lecturas de glucosa desde `xDrip+`
- Guarda lecturas recientes y tratamientos
- Replica la forma de la API de Nightscout que usan los clientes existentes
- Funciona con apps y herramientas compatibles con Nightscout
- Muestra una página simple de `health` en el navegador

## Qué No Hace

- No es Nightscout completo
- No es tu sistema médico principal
- No incluye gráficas, informes ni análisis avanzados

Si necesitas la experiencia completa de Nightscout, Nightscout completo sigue siendo la mejor opción.

## Despliegue Gratis Más Rápido

La forma más fácil es usar el flujo oficial de Cloudflare:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Despliegue En 3 Pasos

1. Haz clic en el botón `Deploy to Cloudflare`.
2. Sigue las pantallas de Cloudflare hasta que termine el despliegue.
3. Abre la URL que te da Cloudflare, por ejemplo `https://tu-worker.workers.dev/health`.

En la primera visita, GlucoEasy crea automáticamente un `API_SECRET` de 6 caracteres y lo muestra una sola vez. Guárdalo en ese momento, porque lo necesitarás en `xDrip+`.

## Configurar xDrip+

En `xDrip+`, usa la opción `Nightscout Sync REST API` e introduce:

```text
https://API_SECRET@tu-worker.workers.dev/api/v1/
```

Sustituye:

- `API_SECRET` por tu secreto de 6 caracteres
- `tu-worker.workers.dev` por la URL de Cloudflare

Importante:

- mantén `/api/v1/` exactamente como aparece
- no borres la `/` final

## Cómo Comprobar Que Funciona

Abre esta página en tu navegador:

```text
https://tu-worker.workers.dev/health
```

Página en español:

```text
https://tu-worker.workers.dev/es/health
```

Ejemplo de la pantalla `health` en español:

![Pantalla health en español](docs/images/health-es.png)

Deberías ver:

- la última lectura de glucosa
- el último tratamiento, si existe
- cuántas lecturas hay guardadas
- cuántos tratamientos hay guardados

También puedes revisar:

```text
https://tu-worker.workers.dev/api/v1/status.json
```

## Por Qué Importa La Compatibilidad Con Nightscout

El valor principal de GlucoEasy no es solo que sea más pequeño.

Es que te permite seguir usando el ecosistema Nightscout que ya conoces:

- apps móviles
- herramientas de seguimiento
- integraciones que ya hablan con la API de Nightscout

Eso reduce muchísimo la fricción del cambio y simplifica el despliegue.

## Si Algo No Funciona

### No Aparecen Datos

- Comprueba que `xDrip+` use la URL completa con `/api/v1/`
- Comprueba que el `API_SECRET` sea correcto
- Abre `/health` y revisa si aparecen lecturas recientes

### Error 401

- Lo más probable es que el secreto sea incorrecto
- Usa el mismo secreto de 6 caracteres que viste en la primera configuración

### Has Olvidado El Secreto

- La solución más sencilla suele ser desplegar de nuevo y guardar bien el nuevo secreto
- Los usuarios avanzados pueden cambiarlo manualmente; ver [README.technical.es.md](README.technical.es.md)

### La Página Abre Pero Los Datos Son Antiguos

- Revisa la hora y la zona horaria del teléfono
- GlucoEasy solo conserva las lecturas más recientes

## Licencia

Este proyecto está licenciado bajo MIT. Consulta [LICENSE](LICENSE).
