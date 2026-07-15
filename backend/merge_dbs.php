<?php

$celonica = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=celonica_db", "postgres", "dhanu231", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$formBuilder = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=form_builder_prod", "postgres", "dhanu231", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

echo "Connected to both databases.\n";

// 1. Merge users
$stmt = $celonica->query("SELECT * FROM users");
$celonicaUsers = $stmt->fetchAll(PDO::FETCH_ASSOC);

$userIdMap = []; // Old ID => New ID

foreach ($celonicaUsers as $user) {
    // Check if user already exists by email
    $stmt = $formBuilder->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$user['email']]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($existing) {
        $userIdMap[$user['id']] = $existing['id'];
        echo "User {$user['email']} already exists. Mapped ID {$user['id']} to {$existing['id']}.\n";
    } else {
        // Insert new user
        $newId = sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x', mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000, mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff));
        $stmt = $formBuilder->prepare("INSERT INTO users (id, name, email, email_verified_at, password, remember_token, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING id");
        // Handling columns safely. If celonica has more columns, we should extract them.
        $stmt->execute([
            $newId, $user['name'], $user['email'], $user['email_verified_at'], $user['password'], 
            $user['remember_token'], $user['created_at'], $user['updated_at']
        ]);
        $newId = $stmt->fetchColumn();
        $userIdMap[$user['id']] = $newId;
        echo "Inserted user {$user['email']}. Mapped ID {$user['id']} to $newId.\n";
    }
}

// Write the mapping to a file for reference
file_put_contents('user_id_map.json', json_encode($userIdMap));
echo "User merge complete.\n";

?>
