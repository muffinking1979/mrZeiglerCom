<?php
// Tiny JSON storage API for the class calendars' admin-added events.
//   GET  api.php?cal=<slug>                    -> { events } (public)
//   POST api.php?cal=<slug>  {password,events} -> save (admin only)
//   POST api.php?action=login {password}       -> check the admin password
// The admin password lives in config.php (see config.sample.php), never in the browser bundle.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond($code, $data) {
    http_response_code($code);
    echo json_encode($data);
    exit;
}

$dataDir = __DIR__ . '/data';
$maxBytes = 1024 * 1024; // 1 MB per calendar is far more than needed

// ── Reads ──────────────────────────────────────────────────────────────────
$slug = isset($_GET['cal']) ? $_GET['cal'] : '';
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!preg_match('/^[a-z0-9-]{1,40}$/', $slug)) respond(400, ['error' => 'Bad calendar name']);
    $file = "$dataDir/$slug.json";
    if (!is_file($file)) respond(200, ['events' => new stdClass()]);
    readfile($file);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') respond(405, ['error' => 'Method not allowed']);

// ── Auth ───────────────────────────────────────────────────────────────────
$configFile = __DIR__ . '/config.php';
if (!is_file($configFile)) respond(503, ['error' => 'Editing is not set up: create config.php on the server']);
$config = require $configFile;

$raw = file_get_contents('php://input');
if (strlen($raw) > $maxBytes) respond(413, ['error' => 'Too large']);
$body = json_decode($raw, true);
if (!is_array($body)) respond(400, ['error' => 'Bad JSON']);

$password = isset($body['password']) && is_string($body['password']) ? $body['password'] : '';
if (empty($config['password']) || !hash_equals((string)$config['password'], $password)) {
    sleep(1); // slow down password guessing
    respond(401, ['error' => 'Wrong password']);
}

if (isset($_GET['action']) && $_GET['action'] === 'login') respond(200, ['ok' => true]);

// ── Save ───────────────────────────────────────────────────────────────────
if (!preg_match('/^[a-z0-9-]{1,40}$/', $slug)) respond(400, ['error' => 'Bad calendar name']);
if (!isset($body['events']) || !is_array($body['events'])) respond(400, ['error' => 'Missing events']);

if (!is_dir($dataDir) && !mkdir($dataDir, 0755, true)) respond(500, ['error' => 'Cannot create data folder']);
if (count(glob("$dataDir/*.json")) >= 50) respond(400, ['error' => 'Too many calendars']);

// Empty PHP array would encode as [] instead of {}; force an object.
$events = count($body['events']) === 0 ? new stdClass() : $body['events'];
$json = json_encode(['events' => $events], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

$file = "$dataDir/$slug.json";
$tmp = $file . '.tmp';
if (file_put_contents($tmp, $json, LOCK_EX) === false || !rename($tmp, $file)) {
    respond(500, ['error' => 'Could not write file']);
}
respond(200, ['ok' => true]);
