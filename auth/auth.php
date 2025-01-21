<?php
error_reporting(E_ALL & ~E_DEPRECATED);
require __DIR__ . '/../vendor/autoload.php'; // Autoload Firebase Admin SDK

use Kreait\Firebase\Factory;

$firebaseConfig = [
    "type"=> "service_account",
    "project_id"=> "bonbon-8a34a",
    "private_key_id"=> "8e5bc448e4bb6e8afdec2f73edfe3919bc578525",
    "private_key"=> "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCqjppAVoKGYOrD\nuTC4KND26eKtC6LeOuVjpmrENruROaq1HSwKAEZtUKA2oxR0k59y25FJP0GtG0c0\nB28e87Nz+Rxh6VgQ6r5yRoSdML1kqM8QXX5M6j31Ca/5ghr0XPnAnUcIpidgixfG\nuQvSIfm0Yn4JH+rOCuUoPJY4fGE8a7bnR4n33WUCnOakRH9mign6pqfO/pCzJGM8\nhSViarT9kGtzWETMUSptVwF/VG+wX3fQmDAQxkB3A2qqW43LxgR2Q0TnlipCpGjf\nheg7hPdkK/S5SphOl87Y+zv1kD3VN8lYAttszrFy9X50+Wugduu/PEodzUlsH1VD\n6QVGjhxTAgMBAAECggEAP0UCPL660c2vGScgRxjBF++AarAn3Wecw8Au2BXzs7Zg\nOKqXNSiP96pSnKIXiv1eR3XjKfhgzS4S1l6xnppJ5koxeLLeu/vQ5UR6mnNDts0W\nbxw3p6G3lShgUt8sT50T+xt9B9zXO62thscLdwqqfnuRBKKF8KRDCQ+crFybl5VD\nY3TvBon04gNtkW5gDyc/OpLBEVZSXUpt1m4GtTZJwtB36XFKOukD3EQMC5QE2aZU\n0TPZH1aLK7dM8M93Ax8BNj3o3AsPDp1/UxbviiwzIhQpbdHRqExK0TpomDkcU9EG\nBzw0Olb7w2aYNh24g2mexk6UbSHum37cEQLfWmKqaQKBgQDtxxgH7gSI8XOEIUQq\nEVX2t5IF/74kMN3rSEnfhoByL1NdDyLKdHjBbLyZ9JoXkZa61WLXBdhm/f26enjr\nuFYnc0lzcsau7OqyYK0dz9rLjlrh3pUIhO5TCnMg74UTQQejKMkPwC68UZx/WdpX\nM/j+CAfPEdnoDclR7EGzxQP6uQKBgQC3oLjLAEfiK2N7s3H1FUXIXTNPSlEfT/MH\nDDGoVUNGzPj001chRI6c9FN+AEYJMN4T3SohRMNrNd4Snssgc2WKWTslLO7/O1TY\nv6f+S6KeNYgAK0bhkVZurPcFFpbfXSY8nwUxgmsbPVJzcGpDORPqdm/AZR7FnWUs\n8/ovhIpZawKBgBf8VHVAUl7KFIAIpwqjUwufOvC1+qVF9KzuTt1ogP6DvaIOi9Dm\nbOP+JwxUu1KTUiQosF7GbSz+hCDSh+4nWzGBlLA7rMUqiwZRcEUomYadJpfQTzJb\nznq7/B8fakol7jJMQ/P9y/kdNm82Tisrx/tALiF6SIP7GArWjU4oGp2pAoGAMXHu\nsILn2EfUpud/5P2QZ85o1Y3uYB8YEqq+6FPlJLhmxQ3vZT7fo/XKUaBjO3BULEce\nZAzvDfxYSu1FRvyrt+AlI/KAfGuOgjrBUqEtLaq+b0U39d87xdt/PHiDsauUczhi\nnp0+l/wgKoN3qZhB+51epBDWg2HJb5xWntryofcCgYEAvHv8i00Jvp9UIdLBkstb\nO8h7dBtyxa2n1CPXa+2KYavi5IpVNmxYojY57CtdMDncTTWurlNnvimxkGZhGWUR\nBYzQp9n6KnHikMcnGH7gL3VSUP8bGH1s75nC2p1f1FHIdSnX4IveSm3X+X61RyaS\nLjOYofVZz5KTJdpweOlPj+c=\n-----END PRIVATE KEY-----\n",
    "client_email"=> "firebase-adminsdk-3dfwz@bonbon-8a34a.iam.gserviceaccount.com",
    "client_id"=> "101403315987803528026",
    "auth_uri"=> "https://accounts.google.com/o/oauth2/auth",
    "token_uri"=> "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url"=> "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url"=> "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-3dfwz%40bonbon-8a34a.iam.gserviceaccount.com",
    "universe_domain"=> "googleapis.com"
];

$factory = (new Factory())->withServiceAccount($firebaseConfig);

// Firebase services initialization
$auth = $factory->createAuth(); // For authentication
$firestore = $factory->createFirestore(); // For Firestore database
$database = $firestore->database(); // Firestore database instance

// To confirm everything works, you can print this message.
echo "Firebase initialized successfully.";
?>
