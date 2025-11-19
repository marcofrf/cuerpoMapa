<?php
/**
 * Save Postcard API Endpoint
 * Saves a new postcard to the MySQL database
 */

// Disable error reporting in production for security
error_reporting(0);
ini_set('display_errors', 0);

// Define API access constant
define('API_ACCESS', true);

// Set CORS headers to allow requests from your domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => true, 'message' => 'Method not allowed']);
    exit;
}

// Include database configuration
require_once 'db-config.php';

try {
    // Get JSON input
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // Validate input
    if (!isset($data['content']) || empty(trim($data['content']))) {
        sendErrorResponse('Content is required', 400);
    }
    
    $content = trim($data['content']);
    
    // Get database connection
    $conn = getDbConnection();
    
    if (!$conn) {
        sendErrorResponse('Database connection failed', 500);
    }
    
    // Prepare SQL statement to prevent SQL injection
    $stmt = $conn->prepare("INSERT INTO postcards (content) VALUES (?)");
    
    if (!$stmt) {
        closeDbConnection($conn);
        sendErrorResponse('Failed to prepare statement: ' . $conn->error, 500);
    }
    
    $stmt->bind_param('s', $content);
    
    // Execute the statement
    if (!$stmt->execute()) {
        $error = $stmt->error;
        $stmt->close();
        closeDbConnection($conn);
        sendErrorResponse('Failed to save postcard: ' . $error, 500);
    }
    
    $insertId = $conn->insert_id;
    
    // Close statement and connection
    $stmt->close();
    closeDbConnection($conn);
    
    // Send successful response
    sendJsonResponse([
        'success' => true,
        'message' => 'Postcard saved successfully',
        'id' => $insertId
    ], 201);
    
} catch (Exception $e) {
    error_log('API Error in save-postcard.php: ' . $e->getMessage());
    sendErrorResponse('An error occurred while saving postcard', 500);
}

