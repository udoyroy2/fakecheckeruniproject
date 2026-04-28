<?php
header("Content-Type: application/json");

if (!isset($_FILES["video"])) {
    echo json_encode(["error" => "No video uploaded"]);
    exit;
}

$fileSize = $_FILES["video"]["size"];
$fileName = strtolower($_FILES["video"]["name"]);

$score = 50;
$explanations = [];

// File name check
if (
    strpos($fileName, "fake") !== false ||
    strpos($fileName, "deepfake") !== false ||
    strpos($fileName, "viral") !== false ||
    strpos($fileName, "edited") !== false ||
    strpos($fileName, "generated") !== false
) {
    $score = 85;
    $explanations[] = "🚨 ফাইলের নামে সন্দেহজনক শব্দ পাওয়া গেছে";
}

// File size logic
elseif ($fileSize < 500 * 1024) {
    $score = 70;
    $explanations[] = "⚠️ ভিডিও সাইজ অনেক ছোট - সন্দেহজনক হতে পারে";
}
elseif ($fileSize > 20 * 1024 * 1024) {
    $score = 35;
    $explanations[] = "✅ ভিডিও সাইজ স্বাভাবিক মনে হচ্ছে";
}
else {
    $score = 55;
    $explanations[] = "⚠️ ভিডিওটি সম্পূর্ণ বিশ্লেষণ সম্ভব হয়নি";
}

// Extra explanation
$explanations[] = "📌 Advanced analysis server support নেই (free hosting limitation)";
$explanations[] = "🔍 ভিডিওটি trusted source দিয়ে যাচাই করুন";
$explanations[] = "⚠️ এটি ১০০% proof না";

// Final output
echo json_encode([
    "score" => $score,
    "explanations" => $explanations
]);
?>