<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Sanitize and validate input
    $name = strip_tags(trim($_POST["name"] ?? ''));
    $email = filter_var(trim($_POST["email"] ?? ''), FILTER_SANITIZE_EMAIL);
    $phone = strip_tags(trim($_POST["phone"] ?? ''));
    $subject = strip_tags(trim($_POST["subject"] ?? ''));
    $message = strip_tags(trim($_POST["message"] ?? ''));

    // Validate required fields
    if (empty($name) || empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
        header("Location: ../contact.html?status=error");
        exit;
    }

    // Sanitize values for use in email headers (prevent header injection)
    $name = str_replace(["\r", "\n"], '', $name);
    $email = str_replace(["\r", "\n"], '', $email);
    $subject = str_replace(["\r", "\n"], '', $subject);
    $subject = !empty($subject) ? $subject : 'No Subject';

    $recipient = "luyandabschemes@gmail.com";
    $email_subject = "New Message: " . $subject;

    $email_content = "Name: $name\n";
    $email_content .= "Email: $email\n";
    $email_content .= "Phone: $phone\n\n";
    $email_content .= "Message:\n$message\n";

    // Use a safe From header
    $safe_email = filter_var($email, FILTER_VALIDATE_EMAIL) ? $email : 'noreply@example.com';
    $email_headers = "From: LB Physiotherapy <noreply@lbphysiotherapy.co.za>\r\n";
    $email_headers .= "Reply-To: $name <$safe_email>\r\n";
    $email_headers .= "X-Mailer: PHP/" . phpversion();

    if (mail($recipient, $email_subject, $email_content, $email_headers)) {
        header("Location: ../mail-success.html");
        exit;
    } else {
        header("Location: ../contact.html?status=server_error");
        exit;
    }
} else {
    header("Location: ../contact.html");
    exit;
}
?>
