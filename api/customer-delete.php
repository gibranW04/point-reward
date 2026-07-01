<?php
require_once __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method tidak diizinkan']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$customer_id = trim($input['customer_id'] ?? '');

if ($customer_id === '') {
    http_response_code(400);
    echo json_encode(['error' => 'customer_id wajib diisi']);
    exit;
}

try {
    $pdo->beginTransaction();

    // Hapus relasi terkait
    $pdo->prepare("DELETE FROM reward_history WHERE customer_id = ?")->execute([$customer_id]);
    $pdo->prepare("DELETE FROM point_history WHERE customer_id = ?")->execute([$customer_id]);

    // Hapus customer
    $stmt = $pdo->prepare("DELETE FROM customers WHERE customer_id = ?");
    $stmt->execute([$customer_id]);

    if ($stmt->rowCount() === 0) {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Customer tidak ditemukan']);
        exit;
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Customer $customer_id dan seluruh riwayatnya berhasil dihapus"
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Gagal menghapus: ' . $e->getMessage()]);
}
