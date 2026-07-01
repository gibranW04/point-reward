<?php
require_once __DIR__ . '/config.php';

try {
    // Buat tabel customers
    $pdo->exec("CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(10) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        total_points INT DEFAULT 0,
        level VARCHAR(10) DEFAULT 'Bronze',
        total_transactions INT DEFAULT 0,
        last_transaction_date DATE DEFAULT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Buat tabel point_history
    $pdo->exec("CREATE TABLE IF NOT EXISTS point_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        transaction_no VARCHAR(20) NOT NULL,
        total_amount DECIMAL(12,2) NOT NULL,
        points_earned INT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Buat tabel reward_history
    $pdo->exec("CREATE TABLE IF NOT EXISTS reward_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        customer_id VARCHAR(10) NOT NULL,
        date DATE NOT NULL,
        reward_name VARCHAR(100) NOT NULL,
        points_spent INT NOT NULL,
        status VARCHAR(20) NOT NULL DEFAULT 'Diproses',
        FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Bersihkan data lama
    $pdo->exec("DELETE FROM reward_history");
    $pdo->exec("DELETE FROM point_history");
    $pdo->exec("DELETE FROM customers");

    // Reset auto increment
    $pdo->exec("ALTER TABLE customers AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE point_history AUTO_INCREMENT = 1");
    $pdo->exec("ALTER TABLE reward_history AUTO_INCREMENT = 1");

    // --- SEED CUSTOMERS ---
    $customers = [
        ['C001', 'Andi Pratama', 1200, 'Silver', 15, '2026-06-24'],
        ['C002', 'Siti Rahmawati', 2500, 'Silver', 28, '2026-06-25'],
        ['C003', 'Budi Santoso', 350, 'Bronze', 5, '2026-06-20'],
        ['C004', 'Dewi Lestari', 1800, 'Silver', 20, '2026-06-23'],
        ['C005', 'Eko Saputro', 4500, 'Gold', 42, '2026-06-26'],
        ['C006', 'Fitri Handayani', 150, 'Bronze', 3, '2026-06-15'],
        ['C007', 'Galih Permana', 800, 'Bronze', 10, '2026-06-22'],
        ['C008', 'Hesti Wulandari', 3200, 'Gold', 35, '2026-06-25'],
        ['C009', 'Irfan Hakim', 500, 'Bronze', 7, '2026-06-18'],
        ['C010', 'Joko Widodo', 6000, 'Gold', 55, '2026-06-26'],
        ['C011', 'Kartika Sari', 950, 'Bronze', 12, '2026-06-21'],
        ['C012', 'Lukman Nugroho', 2200, 'Silver', 25, '2026-06-24'],
    ];

    $stmt = $pdo->prepare("INSERT INTO customers (customer_id, name, total_points, level, total_transactions, last_transaction_date) VALUES (?, ?, ?, ?, ?, ?)");
    foreach ($customers as $c) {
        $stmt->execute($c);
    }

    // --- SEED POINT HISTORY ---
    $pointData = [
        // Andi Pratama (C001)
        ['C001', '2026-06-24', 'TRX-202606-001', 350000, 350],
        ['C001', '2026-06-20', 'TRX-202606-002', 250000, 250],
        ['C001', '2026-06-15', 'TRX-202606-003', 180000, 180],
        ['C001', '2026-06-10', 'TRX-202606-004', 200000, 200],
        ['C001', '2026-06-05', 'TRX-202606-005', 150000, 150],
        ['C001', '2026-06-01', 'TRX-202606-006', 70000, 70],
        // Siti Rahmawati (C002)
        ['C002', '2026-06-25', 'TRX-202606-007', 500000, 500],
        ['C002', '2026-06-22', 'TRX-202606-008', 450000, 450],
        ['C002', '2026-06-18', 'TRX-202606-009', 350000, 350],
        ['C002', '2026-06-14', 'TRX-202606-010', 300000, 300],
        ['C002', '2026-06-10', 'TRX-202606-011', 250000, 250],
        ['C002', '2026-06-05', 'TRX-202606-012', 200000, 200],
        ['C002', '2026-06-01', 'TRX-202606-013', 150000, 150],
        // Budi Santoso (C003)
        ['C003', '2026-06-20', 'TRX-202606-014', 120000, 120],
        ['C003', '2026-06-15', 'TRX-202606-015', 80000, 80],
        ['C003', '2026-06-10', 'TRX-202606-016', 50000, 50],
        ['C003', '2026-06-05', 'TRX-202606-017', 100000, 100],
        // Dewi Lestari (C004)
        ['C004', '2026-06-23', 'TRX-202606-018', 400000, 400],
        ['C004', '2026-06-19', 'TRX-202606-019', 350000, 350],
        ['C004', '2026-06-14', 'TRX-202606-020', 300000, 300],
        ['C004', '2026-06-09', 'TRX-202606-021', 250000, 250],
        ['C004', '2026-06-04', 'TRX-202606-022', 200000, 200],
        ['C004', '2026-06-01', 'TRX-202606-023', 150000, 150],
        // Eko Saputro (C005)
        ['C005', '2026-06-26', 'TRX-202606-024', 800000, 800],
        ['C005', '2026-06-23', 'TRX-202606-025', 750000, 750],
        ['C005', '2026-06-19', 'TRX-202606-026', 600000, 600],
        ['C005', '2026-06-14', 'TRX-202606-027', 500000, 500],
        ['C005', '2026-06-10', 'TRX-202606-028', 450000, 450],
        ['C005', '2026-06-05', 'TRX-202606-029', 400000, 400],
        ['C005', '2026-06-01', 'TRX-202606-030', 350000, 350],
        // Fitri Handayani (C006)
        ['C006', '2026-06-15', 'TRX-202606-031', 50000, 50],
        ['C006', '2026-06-10', 'TRX-202606-032', 60000, 60],
        ['C006', '2026-06-05', 'TRX-202606-033', 40000, 40],
        // Galih Permana (C007)
        ['C007', '2026-06-22', 'TRX-202606-034', 200000, 200],
        ['C007', '2026-06-17', 'TRX-202606-035', 180000, 180],
        ['C007', '2026-06-12', 'TRX-202606-036', 150000, 150],
        ['C007', '2026-06-07', 'TRX-202606-037', 130000, 130],
        ['C007', '2026-06-02', 'TRX-202606-038', 140000, 140],
        // Hesti Wulandari (C008)
        ['C008', '2026-06-25', 'TRX-202606-039', 700000, 700],
        ['C008', '2026-06-21', 'TRX-202606-040', 650000, 650],
        ['C008', '2026-06-16', 'TRX-202606-041', 550000, 550],
        ['C008', '2026-06-11', 'TRX-202606-042', 500000, 500],
        ['C008', '2026-06-06', 'TRX-202606-043', 400000, 400],
        // Irfan Hakim (C009)
        ['C009', '2026-06-18', 'TRX-202606-044', 100000, 100],
        ['C009', '2026-06-13', 'TRX-202606-045', 120000, 120],
        ['C009', '2026-06-08', 'TRX-202606-046', 90000, 90],
        ['C009', '2026-06-03', 'TRX-202606-047', 110000, 110],
        ['C009', '2026-06-01', 'TRX-202606-048', 80000, 80],
        // Joko Widodo (C010)
        ['C010', '2026-06-26', 'TRX-202606-049', 1000000, 1000],
        ['C010', '2026-06-24', 'TRX-202606-050', 900000, 900],
        ['C010', '2026-06-20', 'TRX-202606-051', 800000, 800],
        ['C010', '2026-06-16', 'TRX-202606-052', 750000, 750],
        ['C010', '2026-06-12', 'TRX-202606-053', 700000, 700],
        ['C010', '2026-06-08', 'TRX-202606-054', 600000, 600],
        ['C010', '2026-06-04', 'TRX-202606-055', 500000, 500],
        // Kartika Sari (C011)
        ['C011', '2026-06-21', 'TRX-202606-056', 200000, 200],
        ['C011', '2026-06-16', 'TRX-202606-057', 180000, 180],
        ['C011', '2026-06-11', 'TRX-202606-058', 150000, 150],
        ['C011', '2026-06-06', 'TRX-202606-059', 120000, 120],
        // Lukman Nugroho (C012)
        ['C012', '2026-06-24', 'TRX-202606-060', 300000, 300],
        ['C012', '2026-06-20', 'TRX-202606-061', 280000, 280],
        ['C012', '2026-06-15', 'TRX-202606-062', 250000, 250],
        ['C012', '2026-06-10', 'TRX-202606-063', 220000, 220],
        ['C012', '2026-06-05', 'TRX-202606-064', 200000, 200],
    ];

    $stmt = $pdo->prepare("INSERT INTO point_history (customer_id, date, transaction_no, total_amount, points_earned) VALUES (?, ?, ?, ?, ?)");
    foreach ($pointData as $p) {
        $stmt->execute($p);
    }

    // --- SEED REWARD HISTORY ---
    $rewardData = [
        // Andi Pratama (C001)
        ['C001', '2026-06-22', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C001', '2026-06-15', 'Gratis Ongkir', 200, 'Berhasil'],
        ['C001', '2026-06-08', 'Diskon 20%', 300, 'Diproses'],
        // Siti Rahmawati (C002)
        ['C002', '2026-06-23', 'Voucher Rp100.000', 1000, 'Berhasil'],
        ['C002', '2026-06-18', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C002', '2026-06-10', 'Merchandise', 400, 'Diproses'],
        ['C002', '2026-06-03', 'Diskon 20%', 300, 'Dibatalkan'],
        // Budi Santoso (C003)
        ['C003', '2026-06-18', 'Gratis Ongkir', 200, 'Berhasil'],
        ['C003', '2026-06-12', 'Diskon 20%', 300, 'Dibatalkan'],
        // Dewi Lestari (C004)
        ['C004', '2026-06-21', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C004', '2026-06-14', 'Gratis Ongkir', 200, 'Berhasil'],
        ['C004', '2026-06-07', 'Diskon 20%', 300, 'Diproses'],
        // Eko Saputro (C005)
        ['C005', '2026-06-25', 'Voucher Rp100.000', 1000, 'Berhasil'],
        ['C005', '2026-06-20', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C005', '2026-06-15', 'Merchandise', 400, 'Berhasil'],
        ['C005', '2026-06-08', 'Gratis Ongkir', 200, 'Diproses'],
        ['C005', '2026-06-02', 'Diskon 20%', 300, 'Dibatalkan'],
        // Fitri Handayani (C006)
        ['C006', '2026-06-13', 'Gratis Ongkir', 200, 'Dibatalkan'],
        // Galih Permana (C007)
        ['C007', '2026-06-20', 'Diskon 20%', 300, 'Berhasil'],
        ['C007', '2026-06-10', 'Gratis Ongkir', 200, 'Diproses'],
        // Hesti Wulandari (C008)
        ['C008', '2026-06-23', 'Voucher Rp100.000', 1000, 'Berhasil'],
        ['C008', '2026-06-16', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C008', '2026-06-09', 'Merchandise', 400, 'Diproses'],
        // Irfan Hakim (C009)
        ['C009', '2026-06-16', 'Gratis Ongkir', 200, 'Berhasil'],
        // Joko Widodo (C010)
        ['C010', '2026-06-25', 'Voucher Rp100.000', 1000, 'Berhasil'],
        ['C010', '2026-06-22', 'Voucher Rp100.000', 1000, 'Berhasil'],
        ['C010', '2026-06-18', 'Merchandise', 400, 'Berhasil'],
        ['C010', '2026-06-14', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C010', '2026-06-08', 'Diskon 20%', 300, 'Diproses'],
        ['C010', '2026-06-02', 'Gratis Ongkir', 200, 'Dibatalkan'],
        // Kartika Sari (C011)
        ['C011', '2026-06-19', 'Diskon 20%', 300, 'Berhasil'],
        ['C011', '2026-06-09', 'Gratis Ongkir', 200, 'Diproses'],
        // Lukman Nugroho (C012)
        ['C012', '2026-06-22', 'Voucher Rp50.000', 500, 'Berhasil'],
        ['C012', '2026-06-15', 'Diskon 20%', 300, 'Berhasil'],
        ['C012', '2026-06-08', 'Gratis Ongkir', 200, 'Diproses'],
    ];

    $stmt = $pdo->prepare("INSERT INTO reward_history (customer_id, date, reward_name, points_spent, status) VALUES (?, ?, ?, ?, ?)");
    foreach ($rewardData as $r) {
        $stmt->execute($r);
    }

    echo json_encode([
        'success' => true,
        'message' => 'Database berhasil diinisialisasi dan diisi data dummy!',
        'customers' => count($customers),
        'point_history' => count($pointData),
        'reward_history' => count($rewardData)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Gagal: ' . $e->getMessage()]);
}
