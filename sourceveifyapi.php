<?php
header("Content-Type: application/json");

$source = $_POST["source"] ?? "";

if (trim($source) === "") {
    echo json_encode(["error" => "No source link provided"]);
    exit;
}

$domain = parse_url($source, PHP_URL_HOST);
if (!$domain) $domain = $source;
$domain = strtolower(str_replace("www.", "", $domain));


$trustedDomains = [
    "prothomalo.com"      => 92,
    "thedailystar.net"    => 92,
    "bdnews24.com"        => 88,
    "dhakatribune.com"    => 88,
    "bbc.com"             => 95,
    "reuters.com"         => 95,
    "apnews.com"          => 95,
    "kalerkantho.com"     => 80,
    "jugantor.com"        => 78,
    "samakal.com"         => 78,
    "ittefaq.com.bd"      => 75,
    "somoynews.tv"        => 75,
    "channel24bd.tv"      => 73,
    "ntvbd.com"           => 73,
];


$suspiciousPatterns = [
    "blog", "wordpress", "blogspot", "wixsite",
    "viral", "breaking", "fake", "exposed",
    "truth", "hidden", "secret", "leaked",
    "news24live", "bdlive", "newsbd", "flashnews"
];

$trustedScore   = 0;
$suspiciousScore = 0;
$unknownScore   = 0;
$sources        = ["🔍 Domain checked: " . $domain];
$matchedTrust   = false;


foreach ($trustedDomains as $trusted => $score) {
    if (str_contains($domain, $trusted)) {
        $trustedScore    = $score;
        $suspiciousScore = 100 - $score;
        $unknownScore    = 5;
        $matchedTrust    = true;
        $sources[] = "✅ বিশ্বস্ত সংবাদমাধ্যম হিসেবে চিহ্নিত";
        $sources[] = "📰 Source credibility score: " . $score . "%";
        $sources[] = "এই লিংক শেয়ার করা তুলনামূলক নিরাপদ";
        break;
    }
}


if (!$matchedTrust) {
    $suspiciousCount = 0;

    foreach ($suspiciousPatterns as $pattern) {
        if (str_contains($domain, $pattern)) {
            $suspiciousCount++;
        }
    }

    
    $path = strtolower(parse_url($source, PHP_URL_PATH) ?? "");
    $suspiciousPathWords = ["viral", "breaking", "shocking", "exposed", "leaked", "fake"];

    foreach ($suspiciousPathWords as $word) {
        if (str_contains($path, $word)) {
            $suspiciousCount++;
        }
    }

    
    $isBdDomain = str_ends_with($domain, ".bd");

    
    $isHttps = str_starts_with($source, "https://");

    if ($suspiciousCount >= 2) {
        $trustedScore    = 10;
        $suspiciousScore = 85;
        $unknownScore    = 75;
        $sources[] = "🚨 একাধিক সন্দেহজনক বৈশিষ্ট্য পাওয়া গেছে";
        $sources[] = "⚠️ এই লিংক শেয়ার না করাই ভালো";
    } elseif ($suspiciousCount === 1) {
        $trustedScore    = 25;
        $suspiciousScore = 65;
        $unknownScore    = 70;
        $sources[] = "⚠️ কিছু সন্দেহজনক বৈশিষ্ট্য পাওয়া গেছে";
        $sources[] = "অন্য সূত্র থেকে যাচাই করুন";
    } else {
        $trustedScore    = 35;
        $suspiciousScore = 50;
        $unknownScore    = 80;
        $sources[] = "❓ এই source trusted list এ নেই";
        $sources[] = "শেয়ার করার আগে আরও যাচাই করুন";
    }

    
    if ($isBdDomain) {
        $trustedScore += 10;
        $sources[] = "✅ বাংলাদেশি (.bd) ডোমেইন";
    }

    if (!$isHttps) {
        $suspiciousScore += 10;
        $sources[] = "⚠️ HTTPS নেই — নিরাপদ নয়";
    } else {
        $sources[] = "✅ HTTPS সংযোগ আছে";
    }

    
    $trustedScore    = min(95, max(5, $trustedScore));
    $suspiciousScore = min(95, max(5, $suspiciousScore));
    $unknownScore    = min(95, max(5, $unknownScore));
}

echo json_encode([
    "trusted"    => $trustedScore,
    "suspicious" => $suspiciousScore,
    "unknown"    => $unknownScore,
    "sources"    => $sources
]);
?>