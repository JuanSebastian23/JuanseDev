<?php
header('Content-Type: application/json');
// Permitir solicitudes desde el dominio de producción
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Si es una solicitud OPTIONS, terminar aquí (para CORS preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Habilitar registro de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL);

// Crear directorio de logs si no existe
$logDir = __DIR__ . '/logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0755, true);
}

ini_set('error_log', $logDir . '/email_errors.log');

// Inicializar respuesta
$response = array(
    'success' => false,
    'message' => 'Error al procesar la solicitud'
);

// Función para registrar información
function logInfo($message, $data = null) {
    $logFile = __DIR__ . '/logs/email_debug.log';
    $timestamp = date('Y-m-d H:i:s');
    $logMessage = "[$timestamp] $message";
    
    if ($data !== null) {
        $logMessage .= " - " . json_encode($data);
    }
    
    file_put_contents($logFile, $logMessage . PHP_EOL, FILE_APPEND);
}

logInfo("Iniciando proceso de envío de email");

// Cargar configuración
$configPath = __DIR__ . '/config.php';

// Si estamos en producción, podríamos definir las variables directamente
if (isset($_SERVER['ENVIRONMENT']) && $_SERVER['ENVIRONMENT'] === 'production') {
    // Las variables ya deberían estar definidas en el entorno
    define('RESEND_API_KEY', getenv('RESEND_API_KEY'));
    define('CONTACT_EMAIL', getenv('CONTACT_EMAIL'));
    define('SENDER_EMAIL', getenv('SENDER_EMAIL'));
    logInfo("Usando configuración del entorno de producción");
} else if (file_exists($configPath)) {
    // En desarrollo, cargar desde el archivo
    require_once $configPath;
    logInfo("Configuración cargada desde archivo");
} else {
    // Intentar cargar desde la plantilla como fallback
    $templatePath = __DIR__ . '/config.template.php';
    if (file_exists($templatePath)) {
        require_once $templatePath;
        logInfo("Configuración cargada desde plantilla (modo fallback)");
    } else {
        logInfo("Error: No se encontró ninguna configuración válida");
        $response['message'] = 'Error de configuración del servidor';
        echo json_encode($response);
        exit;
    }
}

// Verificar que las constantes estén definidas
if (!defined('RESEND_API_KEY') || !defined('CONTACT_EMAIL') || !defined('SENDER_EMAIL')) {
    logInfo("Error: Variables de configuración no definidas correctamente");
    $response['message'] = 'Error de configuración del servidor';
    echo json_encode($response);
    exit;
}

// Verificar método de solicitud
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    logInfo("Error: Método no permitido", $_SERVER["REQUEST_METHOD"]);
    $response['message'] = 'Método no permitido';
    echo json_encode($response);
    exit;
}

logInfo("Datos POST recibidos", $_POST);

// Verificar campos requeridos
$required_fields = ['name', 'email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
        logInfo("Error: Campo requerido faltante", $field);
        $response['message'] = 'Por favor, completa todos los campos requeridos';
        echo json_encode($response);
        exit;
    }
}

// Obtener datos del formulario
$name = filter_var($_POST['name'], FILTER_SANITIZE_STRING);
$email = filter_var($_POST['email'], FILTER_SANITIZE_EMAIL);
$subject = filter_var($_POST['subject'], FILTER_SANITIZE_STRING);
$message = filter_var($_POST['message'], FILTER_SANITIZE_STRING);

// Validar email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    logInfo("Error: Email inválido", $email);
    $response['message'] = 'Por favor, proporciona un correo electrónico válido';
    echo json_encode($response);
    exit;
}

// Crear contenido HTML del correo
$htmlContent = "
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #8b5cf6; color: white; padding: 10px 20px; border-radius: 5px 5px 0 0; }
        .content { padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px; }
        .footer { font-size: 12px; color: #777; margin-top: 20px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h2>Mensaje de contacto desde tu sitio web</h2>
        </div>
        <div class='content'>
            <p><strong>Nombre:</strong> $name</p>
            <p><strong>Email:</strong> $email</p>
            <p><strong>Asunto:</strong> $subject</p>
            <h3>Mensaje:</h3>
            <p>" . nl2br($message) . "</p>
        </div>
        <div class='footer'>
            <p>Este mensaje fue enviado desde el formulario de contacto de JuanseDev.</p>
        </div>
    </div>
</body>
</html>
";

// Datos para enviar a la API de Resend
$data = array(
    'from' => 'JuanseDev <' . SENDER_EMAIL . '>',
    'to' => CONTACT_EMAIL,
    'subject' => "Contacto web: $subject",
    'html' => $htmlContent,
    'reply_to' => $email
);

logInfo("Preparando envío de email con datos", ["to" => CONTACT_EMAIL, "from" => SENDER_EMAIL, "subject" => $subject]);

// Verificar si estamos en HTTPS para el contexto SSL
$sslVerify = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off');
$contextOptions = [
    'ssl' => [
        'verify_peer' => $sslVerify,
        'verify_peer_name' => $sslVerify,
    ],
    'http' => [
        'timeout' => 30 // aumentar timeout a 30 segundos
    ]
];

// Enviar correo a través de la API de Resend
try {
    // Inicializar cURL con manejo de errores mejorado
    $ch = curl_init('https://api.resend.com/emails');
    
    // Configuraciones cURL mejoradas
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . RESEND_API_KEY,
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30); // timeout en segundos
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, $sslVerify); // Verificación SSL condicional
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, $sslVerify ? 2 : 0); // Verificación host condicional
    
    // Ejecutar la solicitud
    $result = curl_exec($ch);
    
    // Verificar si hubo errores de cURL
    if (curl_errno($ch)) {
        $curlError = curl_error($ch);
        logInfo("Error cURL:", $curlError);
        throw new Exception('Error de conexión cURL: ' . $curlError);
    }
    
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    logInfo("Respuesta API", ["status" => $statusCode, "response" => $result]);
    
    $resultData = json_decode($result, true);

    if ($statusCode >= 200 && $statusCode < 300 && isset($resultData['id'])) {
        // Éxito
        logInfo("Email enviado exitosamente", ["id" => $resultData['id']]);
        $response['success'] = true;
        $response['message'] = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
    } else {
        // Error con la API
        $errorMessage = isset($resultData['error']['message']) ? $resultData['error']['message'] : 'Error al enviar el mensaje.';
        logInfo("Error API:", ["status" => $statusCode, "error" => $errorMessage]);
        
        // Si falla Resend, intentamos con el método alternativo
        if (sendAlternativeEmail($name, $email, $subject, $message)) {
            $response['success'] = true;
            $response['message'] = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
        } else {
            $response['message'] = 'Lo sentimos, no se pudo enviar el mensaje: ' . $errorMessage;
        }
    }
} catch (Exception $e) {
    logInfo("Excepción:", $e->getMessage());
    
    // Si falla Resend, intentamos con el método alternativo
    if (sendAlternativeEmail($name, $email, $subject, $message)) {
        $response['success'] = true;
        $response['message'] = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
    } else {
        $response['message'] = 'Error al enviar el mensaje: ' . $e->getMessage();
    }
}

// Método alternativo usando mail() de PHP
function sendAlternativeEmail($name, $email, $subject, $messageBody) {
    logInfo("Intentando método alternativo de envío");
    
    $to = CONTACT_EMAIL;
    $subject = "Contacto web: $subject";
    
    $headers = [
        'From' => "JuanseDev <noreply@" . $_SERVER['SERVER_NAME'] . ">",
        'Reply-To' => $email,
        'X-Mailer' => 'PHP/' . phpversion(),
        'Content-Type' => 'text/html; charset=UTF-8'
    ];
    
    $message = "
    <html>
    <body>
        <h2>Mensaje de contacto desde tu sitio web</h2>
        <p><strong>Nombre:</strong> $name</p>
        <p><strong>Email:</strong> $email</p>
        <p><strong>Mensaje:</strong></p>
        <p>" . nl2br($messageBody) . "</p>
    </body>
    </html>
    ";
    
    $result = mail($to, $subject, $message, $headers);
    logInfo("Resultado de método alternativo", ["success" => $result]);
    
    return $result;
}

// Enviar respuesta
echo json_encode($response);
logInfo("Proceso finalizado", $response);
?>
