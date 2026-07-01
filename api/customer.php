<?php
require_once __DIR__ . '/config.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter id diperlukan']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM customers WHERE customer_id = ?");
    $stmt->execute([$id]);
    $customer = $stmt->fetch();

    if (!$customer) {
        http_response_code(404);
        echo json_encode(['error' => 'Customer tidak ditemukan']);
        exit;
    }

    echo json_encode(['success' => true, 'data' => $customer]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
