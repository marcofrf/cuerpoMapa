<?php
/**
 * Database Configuration for Cuerpo Mapa
 * Hostinger MySQL Connection
 */

// Prevent direct access
if (!defined('API_ACCESS')) {
    http_response_code(403);
    die('Direct access not permitted');
}

// Load environment variables from .env.php if it exists (created by GitHub Actions)
$envFile = __DIR__ . '/.env.php';
if (file_exists($envFile)) {
    require_once $envFile;
}

// Database credentials - Read from environment variables (set via GitHub Actions)
// Fallback to defined constants if env vars not available (for local testing)
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'your_database_name');
define('DB_USER', getenv('DB_USER') ?: 'your_database_user');
define('DB_PASS', getenv('DB_PASS') ?: 'your_database_password');
define('DB_CHARSET', 'utf8mb4');

/**
 * Create database connection
 * @return mysqli|null Returns mysqli connection or null on failure
 */
function getDbConnection() {
    try {
        $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        
        // Check connection
        if ($conn->connect_error) {
            error_log('Database connection failed: ' . $conn->connect_error);
            return null;
        }
        
        // Set charset to handle special characters properly
        $conn->set_charset(DB_CHARSET);
        
        return $conn;
    } catch (Exception $e) {
        error_log('Database connection exception: ' . $e->getMessage());
        return null;
    }
}

/**
 * Close database connection
 * @param mysqli $conn The connection to close
 */
function closeDbConnection($conn) {
    if ($conn && !$conn->connect_error) {
        $conn->close();
    }
}

/**
 * Send JSON response with CORS headers
 * @param mixed $data The data to send
 * @param int $statusCode HTTP status code
 */
function sendJsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

/**
 * Send error response
 * @param string $message Error message
 * @param int $statusCode HTTP status code
 */
function sendErrorResponse($message, $statusCode = 500) {
    sendJsonResponse([
        'error' => true,
        'message' => $message
    ], $statusCode);
}

