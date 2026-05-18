# Apache JMeter Traffic Tests

Este directorio contiene pruebas de trafico para Nexus usando Apache JMeter.

## Pago aprobado al volver desde Mercado Pago

El plan `payment-verify.jmx` simula multiples usuarios llamando:

```text
POST /api/v1/payments/verify
```

Parametros principales:

- `API_BASE_URL`: URL base del API. En Docker usa `http://host.docker.internal:3000/api/v1` por defecto.
- `TOKEN`: JWT del pasajero. Si no se pasa, el runner genera uno de prueba con `api/scripts/create-test-jwt.js`.
- `BOOKING_ID`: reserva a verificar. Por defecto usa `66666666-6666-6666-6666-666666666666`.
- `THREADS`: usuarios concurrentes. Default `10`.
- `LOOPS`: iteraciones por usuario. Default `5`.
- `RAMP_SECONDS`: segundos para subir la carga. Default `5`.

Ejecutar desde `api/`:

```bash
npm run traffic:jmeter
```

El runner valida primero si el API esta disponible. Si estas probando contra el API local y no esta levantado,
compila `api/`, arranca `node dist/main.js`, espera a que responda y lo apaga al terminar la prueba.

O con parametros:

```powershell
powershell -ExecutionPolicy Bypass -File ../jmeter/run-payments.ps1 `
  -ApiBaseUrl "http://host.docker.internal:3000/api/v1" `
  -Threads 25 `
  -Loops 10 `
  -RampSeconds 10
```

Si prefieres manejar el servidor manualmente:

```powershell
powershell -ExecutionPolicy Bypass -File ../jmeter/run-payments.ps1 -NoStartApi
```

Los resultados quedan en `jmeter/results/`:

- `.jtl`: resultados crudos.
- `payment-verify-report-*/index.html`: reporte HTML de JMeter.

Para probar contra ngrok, cambia `API_BASE_URL`:

```powershell
$env:API_BASE_URL = "https://76d0-181-61-208-159.ngrok-free.app/api/v1"
npm run traffic:jmeter
```
