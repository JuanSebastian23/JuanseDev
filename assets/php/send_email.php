<?php
header('Content-Type: application/json');

// Inicializar respuesta
$response = array(
    'success' => false,
    'message' => 'Error al procesar la solicitud'
);

// Cargar configuración (este archivo no se sube al repositorio)
$configPath = __DIR__ . '/config.php';
if (file_exists($configPath)) {
    require_once $configPath;
} else {
    // En caso de que el archivo de configuración no exista
    $response['message'] = 'Error de configuración del servidor';
    echo json_encode($response);
    exit;
}

// Verificar método de solicitud
if ($_SERVER["REQUEST_METHOD"] != "POST") {
    $response['message'] = 'Método no permitido';
    echo json_encode($response);
    exit;
}

// Verificar campos requeridos
$required_fields = ['name', 'email', 'subject', 'message'];
foreach ($required_fields as $field) {
    if (empty($_POST[$field])) {
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
    'from' => 'JuanseDev <' . SENDER_EMAIL . '>', // Usar constante desde configuración
    'to' => CONTACT_EMAIL, // Usar constante desde configuración
    'subject' => "Contacto web: $subject",
    'html' => $htmlContent,
    'reply_to' => $email
);

// Enviar correo a través de la API de Resend
try {
    $ch = curl_init('https://api.resend.com/emails');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . RESEND_API_KEY, // Usar constante desde configuración
        'Content-Type: application/json'
    ]);

    $result = curl_exec($ch);
    $statusCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $resultData = json_decode($result, true);

    if ($statusCode >= 200 && $statusCode < 300 && isset($resultData['id'])) {
        // Éxito
        $response['success'] = true;
        $response['message'] = '¡Gracias! Tu mensaje ha sido enviado correctamente.';
    } else {
        // Error con la API
        $errorMessage = isset($resultData['error']['message']) ? $resultData['error']['message'] : 'Error al enviar el mensaje.';
        $response['message'] = 'Lo sentimos, no se pudo enviar el mensaje: ' . $errorMessage;
    }
} catch (Exception $e) {
    $response['message'] = 'Error al enviar el mensaje: ' . $e->getMessage();
}

// Enviar respuesta
echo json_encode($response);
?>
