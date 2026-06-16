# TinyScout Lite

TinyScout Lite es un servicio muy pequeño compatible con Nightscout que puedes desplegar gratis en Cloudflare.

Su objetivo es simple: recibir los datos de glucosa desde `xDrip+` y hacerlos disponibles para apps que ya saben hablar con Nightscout.

Version in English: see [README.md](README.md).  
Guía técnica: ver [README.technical.es.md](README.technical.es.md).

## En Una Frase

TinyScout Lite te da un endpoint gratuito y sencillo en la nube para tus datos de diabetes.

## Advertencia Importante

- No es un dispositivo médico.
- No debe usarse para dosificación ni decisiones de tratamiento.
- Úsalo solo como respaldo o recuperación.

## Para Quién Es

Este proyecto es para ti si:

- ya usas `xDrip+`
- quieres un despliegue gratis en la nube
- quieres un respaldo sencillo si tu proveedor principal falla
- usas apps compatibles con Nightscout como `Zukkah`
- no quieres mantener una instalación completa de Nightscout

## Qué Hace

- Recibe lecturas de glucosa desde `xDrip+`
- Guarda lecturas recientes y tratamientos
- Funciona con apps compatibles con Nightscout
- Muestra una página simple de estado en el navegador

## Qué No Hace

- No es Nightscout completo
- No es tu sistema médico principal
- No incluye gráficas, informes ni análisis avanzados

Si quieres una web completa con gráficas y reportes, Nightscout completo encaja mejor.

## Despliegue Gratis Más Rápido

La forma más fácil es usar el flujo oficial de Cloudflare:

<a href="https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2FHankScorpi0%2FTinyScout-Lite" target="_blank" rel="noopener noreferrer">
  <img src="https://deploy.workers.cloudflare.com/button" alt="Deploy to Cloudflare" />
</a>

## Despliegue En 3 Pasos

1. Haz clic en el botón `Deploy to Cloudflare`.
2. Sigue las pantallas de Cloudflare hasta que termine el despliegue.
3. Abre la URL que te da Cloudflare, por ejemplo `https://tu-worker.workers.dev/health`.

En la primera visita, TinyScout Lite crea automáticamente un `API_SECRET` de 6 caracteres y lo muestra una sola vez. Guárdalo en ese momento, porque lo necesitarás en `xDrip+`.

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
- TinyScout Lite solo conserva las lecturas más recientes

## Licencia

Este proyecto está licenciado bajo MIT. Consulta [LICENSE](LICENSE).
