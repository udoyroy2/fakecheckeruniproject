<?php
header("Content-Type: application/json");
require "config.php";

if (!isset($_FILES["video"])) {
    echo json_encode(["error" => "No video uploaded"]);
    exit;
}


$allowedTypes = ["video/mp4", "video/avi", "video/mov", "video/mkv", "video/webm"];
if (!in_array($_FILES["video"]["type"], $allowedTypes)) {
    echo json_encode(["error" => "Invalid file type. Only MP4, AVI, MOV, MKV, WEBM allowed"]);
    exit;
}


if ($_FILES["video"]["size"] > 50 * 1024 * 1024) {
    echo json_encode(["error" => "File too large. Max 50MB"]);
    exit;
}


$ext = pathinfo($_FILES["video"]["name"], PATHINFO_EXTENSION);
$videoPath = "uploads/" . time() . "_video." . $ext;


if (!is_dir("uploads")) mkdir("uploads");

if (!move_uploaded_file($_FILES["video"]["tmp_name"], $videoPath)) {
    echo json_encode(["error" => "Failed to save video"]);
    exit;
}


if (!is_dir("frames")) mkdir("frames");


array_map('unlink', glob("frames/*.jpg"));


exec("ffmpeg -i " . escapeshellarg($videoPath) . " -vf fps=1/2 -vframes 6 frames/frame_%03d.jpg 2>/dev/null");

$frames = glob("frames/*.jpg");

if (empty($frames)) {
    
    unlink($videoPath);
    echo json_encode(["error" => "Could not extract frames. Check if ffmpeg is installed."]);
    exit;
}


$suspicious = 0;
$total = 0;
$explanations = [];

foreach ($frames as $img) {
    $total++;

    $imgData = base64_encode(file_get_contents($img));

    $data = [
        "contents" => [[
            "parts" => [
                [
                    "text" => "Analyze this video frame carefully. Is it fake, deepfake, AI-generated, or manipulated? Look for unnatural facial movements, blurry edges, lighting inconsistencies, or AI artifacts. Answer in 1-2 sentences only."
                ],
                [
                    "inline_data" => [
                        "mime_type" => "image/jpeg",
                        "data" => $imgData
                    ]
                ]
            ]
        ]],
        "generationConfig" => [
            "temperature" => 0.2,
            "maxOutputTokens" => 100
        ]
    ];

    $url = "https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=" . GEMINI_API_KEY;

    $options = [
        "http" => [
            "header"  => "Content-Type: application/json\r\n",
            "method"  => "POST",
            "content" => json_encode($data),
            "timeout" => 15
        ]
    ];

    $context = stream_context_create($options);
    $res = @file_get_contents($url, false, $context);

    if (!$res) {
        $explanations[] = "Frame $total: API response failed";
        continue;
    }

    $json = json_decode($res, true);
    $text = $json["candidates"][0]["content"]["parts"][0]["text"] ?? "Could not analyze";
    $textLower = strtolower($text);

    $explanations[] = "🎞️ Frame $total: " . $text;

    if (
        strpos($textLower, "fake") !== false ||
        strpos($textLower, "deepfake") !== false ||
        strpos($textLower, "manipulated") !== false ||
        strpos($textLower, "ai-generated") !== false ||
        strpos($textLower, "artificial") !== false ||
        strpos($textLower, "generated") !== false ||
        strpos($textLower, "unnatural") !== false
    ) {
        $suspicious++;
    }
}


$score = ($total > 0) ? round(($suspicious / $total) * 100) : 50;


$score = max(10, min(95, $score));


if ($score > 70) {
    array_unshift($explanations, "🚨 " . $suspicious . "/" . $total . " ফ্রেমে সন্দেহজনক কনটেন্ট পাওয়া গেছে");
} elseif ($score > 40) {
    array_unshift($explanations, "⚠️ " . $suspicious . "/" . $total . " ফ্রেম সন্দেহজনক - আরও যাচাই করুন");
} else {
    array_unshift($explanations, "✅ " . $suspicious . "/" . $total . " ফ্রেম সন্দেহজনক - তুলনামূলক স্বাভাবিক");
}


unlink($videoPath);
array_map('unlink', glob("frames/*.jpg"));

echo json_encode([
    "score" => $score,
    "explanations" => $explanations
]);
?>