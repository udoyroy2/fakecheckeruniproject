<?php
header("Content-Type: application/json");
require "config.php";

if (!isset($_FILES["image"])) {
    echo json_encode(["error" => "No image uploaded"]);
    exit;
}

$imageTmpPath = $_FILES["image"]["tmp_name"];

if (!file_exists($imageTmpPath)) {
    echo json_encode(["error" => "Uploaded file not found"]);
    exit;
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://api.imagga.com/v2/tags");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, IMAGGA_API_KEY . ":" . IMAGGA_API_SECRET);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, [
    "image" => new CURLFile(
        $imageTmpPath,
        $_FILES["image"]["type"],
        $_FILES["image"]["name"]
    )
]);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(["error" => curl_error($ch)]);
    curl_close($ch);
    exit;
}

curl_close($ch);

$data = json_decode($response, true);

$labels = [];
$highConfidenceLabels = []; // confidence > 50
$lowConfidenceCount = 0;

if (isset($data["result"]["tags"])) {
    foreach ($data["result"]["tags"] as $tag) {
        $name = $tag["tag"]["en"];
        $confidence = $tag["confidence"];
        $labels[] = $name;

        if ($confidence >= 50) {
            $highConfidenceLabels[] = $name;
        } else {
            $lowConfidenceCount++;
        }
    }
}


$aiSuspiciousLabels = [
    "cgi", "render", "3d", "animation", "cartoon", "digital art",
    "illustration", "generated", "artificial", "composite",
    "photoshop", "edited", "manipulation", "filter"
];

$realPhotoLabels = [
    "photograph", "photo", "camera", "outdoor", "indoor",
    "natural light", "candid", "journalism", "documentary"
];

$aiScore = 0;
$realScore = 0;

foreach ($labels as $label) {
    $lower = strtolower($label);
    foreach ($aiSuspiciousLabels as $sus) {
        if (str_contains($lower, $sus)) {
            $aiScore += 20;
        }
    }
    foreach ($realPhotoLabels as $real) {
        if (str_contains($lower, $real)) {
            $realScore += 15;
        }
    }
}


if ($lowConfidenceCount > count($labels) * 0.6) {
    $aiScore += 15;
}

echo json_encode([
    "labels"              => $labels,
    "highConfidenceLabels" => $highConfidenceLabels,
    "aiScore"             => min(40, $aiScore),   // max +40 bonus from PHP
    "realScore"           => min(30, $realScore), // max -30 bonus from PHP
    "lowConfidenceCount"  => $lowConfidenceCount,
    "totalTags"           => count($labels)
]);
?>