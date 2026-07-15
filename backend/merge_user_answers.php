<?php

$celonica = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=celonica_db", "postgres", "dhanu231", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$formBuilder = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=form_builder_prod", "postgres", "dhanu231", [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
]);

$userIdMap = json_decode(file_get_contents('user_id_map.json'), true);

$stmt = $celonica->query("SELECT * FROM user_answers");
$answers = $stmt->fetchAll(PDO::FETCH_ASSOC);

foreach ($answers as $ans) {
    if (isset($userIdMap[$ans['user_id']])) {
        $mappedUserId = $userIdMap[$ans['user_id']];
        
        $insert = $formBuilder->prepare("INSERT INTO user_answers (id, user_id, question_id, answer_value, is_skipped, created_at, updated_at, iteration) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $isSkipped = $ans['is_skipped'] === '' || $ans['is_skipped'] === null ? 'false' : ($ans['is_skipped'] ? 'true' : 'false');
        $insert->execute([
            $ans['id'], $mappedUserId, $ans['question_id'], $ans['answer_value'], 
            $isSkipped, $ans['created_at'], $ans['updated_at'], $ans['iteration']
        ]);
        echo "Inserted answer for question {$ans['question_id']} by mapped user $mappedUserId.\n";
    } else {
        echo "Warning: user_id {$ans['user_id']} not found in map!\n";
    }
}

// Update the sequence for user_answers
$formBuilder->exec("SELECT setval('user_answers_id_seq', (SELECT COALESCE(MAX(id), 0) + 1 FROM user_answers), false)");
echo "Done.\n";
