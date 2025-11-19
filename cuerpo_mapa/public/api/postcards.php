<?php
/**
 * Postcards API Endpoint
 * Returns a random postcard from MySQL database
 */

// Disable error reporting in production for security
error_reporting(0);
ini_set('display_errors', 0);

// Define API access constant
define('API_ACCESS', true);

// Set CORS headers to allow requests from your domain
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Only allow GET requests
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    header('Content-Type: application/json');
    echo json_encode(['error' => true, 'message' => 'Method not allowed']);
    exit;
}

// Include database configuration
require_once 'db-config.php';

try {
    // Get database connection
    $conn = getDbConnection();
    
    if (!$conn) {
        sendErrorResponse('Database connection failed', 500);
    }
    
    // Prepare SQL query to get a random postcard
    $sql = "SELECT id, content, created_at 
            FROM postcards 
            ORDER BY RAND() 
            LIMIT 1";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        closeDbConnection($conn);
        sendErrorResponse('Query execution failed: ' . $conn->error, 500);
    }
    
    // Fetch the result
    $postcard = $result->fetch_assoc();
    
    // Close connection
    closeDbConnection($conn);
    
    if (!$postcard) {
        sendJsonResponse([
            'success' => true,
            'data' => null,
            'message' => 'No postcards found in database'
        ], 200);
    } else {
        // Send successful response
        sendJsonResponse([
            'success' => true,
            'data' => [
                'id' => (int)$postcard['id'],
                'content' => $postcard['content'],
                'created_at' => $postcard['created_at']
            ]
        ], 200);
    }
    
} catch (Exception $e) {
    error_log('API Error in postcards.php: ' . $e->getMessage());
    sendErrorResponse('An error occurred while fetching postcard', 500);
}

