<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

$customer_id = trim($input['customer_id'] ?? '');
$name = trim($input['name'] ?? '');
$total_points = (int)($input['total_points'] ?? 0);
$total_transactions = (int)($input['total_transactions'] ?? 0);
$last_transaction_date = $input['last_transaction_date'] ?? '';

if ($customer_id === '' || $name === '') {
    http_response_code(400);
    echo json_encode(['error' => 'customer_id dan nama wajib diisi']);
    exit;
}

// Tentukan level berdasarkan poin
if ($total_points >= 3000) $level = 'Gold';
elseif ($total_points >= 1000) $level = 'Silver';
else $level = 'Bronze';

try {
    $stmt = $pdo->prepare("UPDATE customers SET name = ?, total_points = ?, level = ?, total_transactions = ?, last_transaction_date = ? WHERE customer_id = ?");
    $stmt->execute([$name, $total_points, $level, $total_transactions, $last_transaction_date, $customer_id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Customer tidak ditemukan']);
        exit;
    }

    echo json_encode([
        'success' => true,
        'message' => 'Customer berhasil diperbarui',
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
    echo json_encode(['error' => 'Gagal memperbarui: ' . $e->getMessage()]);
}
