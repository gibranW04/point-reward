<?php
require_once __DIR__ . '/config.php';

$search = $_GET['search'] ?? '';
$level = $_GET['level'] ?? '';
$sort = $_GET['sort'] ?? 'desc';
$page = max(1, (int)($_GET['page'] ?? 1));
$limit = max(1, min(50, (int)($_GET['limit'] ?? 5)));
$offset = ($page - 1) * $limit;

$where = [];
$params = [];

if ($search !== '') {
    $where[] = "(c.name LIKE ? OR c.customer_id LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if ($level !== '' && in_array($level, ['Bronze', 'Silver', 'Gold'])) {
    $where[] = "c.level = ?";
    $params[] = $level;
}

$whereClause = count($where) > 0 ? 'WHERE ' . implode(' AND ', $where) : '';

$sortDir = strtoupper($sort) === 'ASC' ? 'ASC' : 'DESC';

try {
    // Hitung total
    $countSql = "SELECT COUNT(*) as total FROM customers c $whereClause";
    $stmt = $pdo->prepare($countSql);
    $stmt->execute($params);
    $total = (int)$stmt->fetch()['total'];
    $totalPages = max(1, ceil($total / $limit));

    // Ambil data
    $sql = "SELECT c.* FROM customers c $whereClause ORDER BY c.total_points $sortDir LIMIT $limit OFFSET $offset";
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $customers = $stmt->fetchAll();

    echo json_encode([
        'success' => true,
        'data' => $customers,
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'totalPages' => $totalPages
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
