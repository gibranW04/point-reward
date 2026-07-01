<?php
require_once __DIR__ . '/config.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter id diperlukan']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM point_history WHERE customer_id = ? ORDER BY date DESC");
    $stmt->execute([$id]);
    $points = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $points]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
