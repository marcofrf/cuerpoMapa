<?php
/**
 * Media References API Endpoint
 * Returns books, movies, and audio references from MySQL database
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
    
    // Prepare SQL query to get all media references
    $sql = "SELECT id, title, description, type, created_at 
            FROM media_references 
            ORDER BY type ASC, created_at DESC";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        closeDbConnection($conn);
        sendErrorResponse('Query execution failed: ' . $conn->error, 500);
    }
    
    // Fetch all results
    $references = [];
    while ($row = $result->fetch_assoc()) {
        $references[] = [
            'id' => (int)$row['id'],
            'title' => $row['title'],
            'description' => $row['description'],
            'type' => $row['type'],
            'created_at' => $row['created_at']
        ];
    }
    
    // Close connection
    closeDbConnection($conn);
    
    // Send successful response
    sendJsonResponse([
        'success' => true,
        'data' => $references,
        'count' => count($references)
    ], 200);
    
} catch (Exception $e) {
    error_log('API Error in references.php: ' . $e->getMessage());
    sendErrorResponse('An error occurred while fetching references', 500);
}

