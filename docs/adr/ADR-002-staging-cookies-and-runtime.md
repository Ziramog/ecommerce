# ADR-002: Configuración de Cookies y Runtime en Staging Privado

## Estado
Aceptado

## Contexto
Medusa 2.21.2 en modo producción (`NODE_ENV=production`) aplica por defecto directivas estrictas de seguridad sobre las cookies de sesión HTTP (`SameSite=Strict` o restricciones de origen cruzado y `Secure=true` requiriendo HTTPS). Adicionalmente, el cliente de Medusa Admin exige que el backend y el dashboard compartan el mismo dominio y que éste no sea `localhost` ni una dirección IP simple sin configuración explícita.

En el entorno de Staging, el backend Medusa corre en un contenedor privado (`mercadal-staging-medusa`) accesible únicamente a través de la red mesh privada de Tailscale (`http://100.124.132.48:9000`) o túnel SSH local (`http://127.0.0.1:9000`), sin certificado TLS ni dominio público configurado. En este esquema, el intento de inicio de sesión en el Admin (`/app`) falla porque el navegador rechaza almacenar o enviar las cookies de sesión bajo HTTP plano sobre una IP.

Por otra parte, Staging convive en el mismo VPS con servicios críticos de WOLFIM y Hermes, por lo que el consumo de recursos debe ser mínimo y acotado.

## Decisiones

1. **Gating de Cookies Exclusivo para Staging**:
   Se implementa en `medusa-config.ts` un mecanismo condicional controlado estrictamente por la variable de entorno `MEDUSA_STAGING_RELAX_COOKIES`:
   ```ts
   ...(process.env.MEDUSA_STAGING_RELAX_COOKIES === "true"
     ? { cookieOptions: { sameSite: "lax", secure: false } }
     : {})
   ```
   Esta configuración permite la persistencia de cookies de sesión sobre HTTP plano en la IP de Tailscale durante las pruebas de staging.

2. **Prohibición Estricta en Producción**:
   Esta relajación de cookies es **exclusiva de Staging**. En el entorno de Producción (Fase 7), el backend operará obligatoriamente tras un reverse proxy con TLS (HTTPS) y bajo dominio corporativo, por lo que `MEDUSA_STAGING_RELAX_COOKIES` **debe permanecer en `false` o ausente**, preservando los defaults de seguridad de Medusa 2.

3. **Modo de Ejecución Unificado (`shared`) en Staging**:
   Se parametriza `projectConfig.workerMode` mediante `MEDUSA_WORKER_MODE` (con fallback a `"shared"`). En Staging se adopta `"shared"` (un único proceso Node.js que atiende API HTTP y tareas de background/workflow), minimizando el uso de memoria a ~150-250 MB frente al esquema de dos instancias separadas (`server` + `worker`) que se empleará en Producción.

4. **Control del Dashboard Admin**:
   Se parametriza `admin.disable` mediante `DISABLE_MEDUSA_ADMIN === "true"`, permitiendo desactivar el dashboard en workers puros o entornos que así lo requieran.

## Consecuencias
- El panel de administración de Medusa es 100% operativo y accesible en Staging a través de Tailscale (`http://100.124.132.48:9000/app`).
- No se expone ninguna vulnerabilidad en producción, ya que la relajación requiere activación explícita por variable de entorno.
- El footprint de recursos en el VPS se mantiene dentro de los límites seguros acordados (< 1 GB RAM asignado, consumo real estimado ~200 MB).
