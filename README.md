# JuanseDev Portfolio

## Configuración del proyecto

### Configuración de variables para el formulario de contacto

Para que el formulario de contacto funcione correctamente, necesitas configurar las credenciales de API:

1. Copia el archivo de plantilla de configuración:
   ```bash
   cp assets/php/config.template.php assets/php/config.php
   ```

2. Edita `assets/php/config.php` con tus credenciales:
   - `RESEND_API_KEY`: Tu clave de API de Resend
   - `CONTACT_EMAIL`: El correo donde quieres recibir los mensajes
   - `SENDER_EMAIL`: El correo configurado en tu cuenta de Resend

### Variables de entorno en producción

En un entorno de producción, puedes establecer estas variables directamente en el servidor:

#### Para servidor Apache
En `.htaccess`:
```
SetEnv RESEND_API_KEY tu_clave_api
SetEnv CONTACT_EMAIL tu_email@ejemplo.com
SetEnv SENDER_EMAIL remitente@ejemplo.com
```

#### Para Nginx con PHP-FPM
En la configuración del pool de PHP-FPM:
```
env[RESEND_API_KEY] = tu_clave_api
env[CONTACT_EMAIL] = tu_email@ejemplo.com
env[SENDER_EMAIL] = remitente@ejemplo.com
```

#### Para hosting compartido
Muchos proveedores de hosting ofrecen una forma de establecer variables de entorno desde el panel de control. Consulta la documentación de tu proveedor de hosting.

## Contribuciones

1. Clona el repositorio
2. Configura el archivo `config.php` como se describió anteriormente
3. ¡Listo para desarrollo!
