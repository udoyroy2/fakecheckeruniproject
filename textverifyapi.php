<?php
header("Content-Type: application/json");
require "config.php";

$text = $_POST["text"] ?? "";

if (trim($text) === "") {
    echo json_encode(["error" => "No text provided"]);
    exit;
}

$score = 50;
$explanations = [];


$query = urlencode($text);
$url = "https://factchecktools.googleapis.com/v1alpha1/claims:search?query=$query&languageCode=bn&key=" . GOOGLE_FACTCHECK_API_KEY;
$response = @file_get_contents($url);
$data = json_decode($response, true);

$foundInFactCheck = false;

if (isset($data["claims"]) && count($data["claims"]) > 0) {
    $claim = $data["claims"][0];
    $review = $claim["claimReview"][0] ?? null;

    if ($review) {
        $foundInFactCheck = true;
        $rating = strtolower($review["textualRating"] ?? "");

        if (str_contains($rating, "false") || str_contains($rating, "fake") ||
            str_contains($rating, "misleading") || str_contains($rating, "misinformation") ||
            str_contains($rating, "incorrect") || str_contains($rating, "wrong")) {
            $score = 90;
        } elseif (str_contains($rating, "true") || str_contains($rating, "correct") ||
                  str_contains($rating, "accurate") || str_contains($rating, "real")) {
            $score = 10;
        } else {
            $score = 55;
        }

        $explanations[] = "✅ Google Fact Check এ এই দাবিটি পাওয়া গেছে";
        $explanations[] = "📰 সূত্র: " . ($review["publisher"]["name"] ?? "Unknown");
        $explanations[] = "⭐ রেটিং: " . ($review["textualRating"] ?? "N/A");
        $explanations[] = "🔍 দাবি: " . mb_substr($claim["text"] ?? "N/A", 0, 100);
    }
}


if (!$foundInFactCheck) {

    $fakeScore = 0;
    $reasons = [];

    $fakeKeywords = [
        "ব্রেকিং", "অবিশ্বাস্য", "চাঞ্চল্যকর", "ভাইরাল", "শকিং",
        "সবাইকে জানান", "শেয়ার করুন", "গোপন তথ্য", "ফাঁস হয়ে গেছে",
        "সরকার লুকাচ্ছে", "মিডিয়া বলছে না", "100%", "গ্যারান্টি",
        "একমাত্র উপায়", "তাৎক্ষণিক", "জরুরি", "সতর্কতা",
        "shocking", "breaking", "viral", "secret", "hidden truth",
        "they don't want you to know", "share now", "urgent"
    ];

    $fakeCount = 0;
    foreach ($fakeKeywords as $kw) {
        if (mb_stripos($text, $kw) !== false) {
            $fakeCount++;
        }
    }

    if ($fakeCount >= 3) {
        $fakeScore += 35;
        $reasons[] = "⚠️ অনেক sensational/clickbait শব্দ পাওয়া গেছে ($fakeCount টি)";
    } elseif ($fakeCount >= 1) {
        $fakeScore += 15;
        $reasons[] = "⚠️ কিছু সন্দেহজনক শব্দ পাওয়া গেছে ($fakeCount টি)";
    }

    
    $credibleSources = [
        "prothomalo", "প্রথম আলো", "daily star", "the daily star",
        "bdnews24", "somoy", "সময়", "channel i", "ntv", "rtv",
        "bbc", "reuters", "ap news", "associated press",
        "সরকারি", "মন্ত্রণালয়", "according to", "গবেষণায়",
        "বিশেষজ্ঞরা জানান", "তথ্য অনুযায়ী"
    ];

    $credibleCount = 0;
    foreach ($credibleSources as $src) {
        if (mb_stripos($text, $src) !== false) {
            $credibleCount++;
        }
    }

    if ($credibleCount >= 2) {
        $fakeScore -= 25;
        $reasons[] = "✅ বিশ্বস্ত সূত্রের উল্লেখ পাওয়া গেছে";
    } elseif ($credibleCount === 1) {
        $fakeScore -= 10;
        $reasons[] = "✅ একটি বিশ্বস্ত সূত্রের উল্লেখ আছে";
    } else {
        $fakeScore += 10;
        $reasons[] = "❌ কোনো বিশ্বস্ত সূত্রের উল্লেখ নেই";
    }

    
    if (preg_match('/\d{4}/', $text)) {
        $fakeScore -= 5;
        $reasons[] = "✅ তারিখ বা সংখ্যা উল্লেখ আছে (বিশ্বাসযোগ্যতা বাড়ায়)";
    }

    
    $wordCount = str_word_count($text);
    $bnWordCount = preg_match_all('/\p{Bengali}+/u', $text, $m);

    if (strlen($text) < 30) {
        $fakeScore += 15;
        $reasons[] = "⚠️ টেক্সট অনেক ছোট, যাচাই করা কঠিন";
    } elseif (strlen($text) > 200) {
        $fakeScore -= 10;
        $reasons[] = "✅ বিস্তারিত তথ্য দেওয়া আছে";
    }

    
    $exclamCount = substr_count($text, '!');
    $questionCount = substr_count($text, '?');
    if ($exclamCount >= 3 || $questionCount >= 3) {
        $fakeScore += 15;
        $reasons[] = "⚠️ অতিরিক্ত বিস্ময়বোধক চিহ্ন ব্যবহার করা হয়েছে";
    }

    
    $score = max(5, min(95, 50 + $fakeScore));

   
    $explanations[] = "🔍 Google Fact Check এ এই দাবির কোনো রেকর্ড পাওয়া যায়নি";
    foreach ($reasons as $r) {
        $explanations[] = $r;
    }

    if ($score >= 70) {
        $explanations[] = "🚨 এই তথ্যটি সম্ভবত মিথ্যা বা বিভ্রান্তিকর";
    } elseif ($score >= 45) {
        $explanations[] = "⚠️ নিশ্চিত না হওয়া পর্যন্ত শেয়ার না করাই ভালো";
    } else {
        $explanations[] = "✅ তথ্যটি তুলনামূলকভাবে বিশ্বাসযোগ্য মনে হচ্ছে";
    }
}

echo json_encode([
    "score" => $score,
    "explanations" => $explanations
]);
?>