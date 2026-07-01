<?php
require_once __DIR__ . '/config.php';

$id = $_GET['id'] ?? '';

if ($id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Parameter id diperlukan']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM reward_history WHERE customer_id = ? ORDER BY date DESC");
    $stmt->execute([$id]);
    $rewards = $stmt->fetchAll();

    echo json_encode(['success' => true, 'data' => $rewards]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
