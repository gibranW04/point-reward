<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$total_points = (int)($input['total_points'] ?? 0);
$total_transactions = (int)($input['total_transactions'] ?? 0);
$last_transaction_date = $input['last_transaction_date'] ?? date('Y-m-d');

if ($name === '') {
    http_response_code(400);
    echo json_encode(['error' => 'Nama customer wajib diisi']);
    exit;
}

// Tentukan level berdasarkan poin
if ($total_points >= 3000) $level = 'Gold';
elseif ($total_points >= 1000) $level = 'Silver';
else $level = 'Bronze';

// Generate customer_id otomatis (C013, C014...)
$stmt = $pdo->query("SELECT MAX(CAST(SUBSTRING(customer_id, 2) AS UNSIGNED)) as max_id FROM customers");
$row = $stmt->fetch();
$newNum = ($row['max_id'] ?? 0) + 1;
$customer_id = 'C' . str_pad($newNum, 3, '0', STR_PAD_LEFT);

try {
    $stmt = $pdo->prepare("INSERT INTO customers (customer_id, name, total_points, level, total_transactions, last_transaction_date) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$customer_id, $name, $total_points, $level, $total_transactions, $last_transaction_date]);

    echo json_encode([
        'success' => true,
        'message' => 'Customer berhasil ditambahkan',
        'data' => [
            'customer_id' => $customer_id,
            'name' => $name,
            'total_points' => $total_points,
            'level' => $level,
            'total_transactions' => $total_transactions,
            'last_transaction_date' => $last_transaction_date
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal menambahkan: ' . $e->getMessage()]);
}
