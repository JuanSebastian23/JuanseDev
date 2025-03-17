<?php
/**
 * Archivo de configuración de plantilla para ser compartido en GitHub
 * Para usar, copie este archivo como config.php y complete los valores
 * En producción, estas variables se pueden definir mediante variables de entorno
 */

// Obtener valores de variables de entorno si están disponibles (producción)
// o usar valores predeterminados (desarrollo)
 
// Clave API para Resend
define('RESEND_API_KEY', getenv('RESEND_API_KEY') ?: 'SU_CLAVE_API_AQUI');

// Correo electrónico de destino para formulario de contacto
define('CONTACT_EMAIL', getenv('CONTACT_EMAIL') ?: 'su_correo@ejemplo.com');

// Correo electrónico remitente (debe estar configurado en tu cuenta de Resend)
define('SENDER_EMAIL', getenv('SENDER_EMAIL') ?: 'correo_remitente@ejemplo.com');
