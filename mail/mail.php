<?php
/**
 * LB Physiotherapy — website form handler
 * Sends every website form (appointments, contact, call-back) to the practice manager
 * as a branded HTML email with a plain-text fallback.
 *
 * Works on standard cPanel / domains.co.za PHP hosting using PHP's mail().
 */

/* ------------------------------------------------------------------
   SETTINGS — change these if the addresses ever change
------------------------------------------------------------------- */
const MAIL_TO        = 'info@lbphysiotherapy.co.za';          // Practice Manager inbox
const MAIL_TO_NAME   = 'Nonzima Mazibuko (Practice Manager)';
const MAIL_FROM      = 'info@lbphysiotherapy.co.za';          // must be a real mailbox on this domain
const MAIL_FROM_NAME = 'LB Physiotherapy Website';
const SITE_URL       = 'https://www.lbphysiotherapy.co.za';
const RATE_LIMIT     = 10;     // max submissions per visitor...
const RATE_WINDOW    = 600;    // ...per 10 minutes

date_default_timezone_set('Africa/Johannesburg');

/* ------------------------------------------------------------------
   Helpers
------------------------------------------------------------------- */
function wants_json(): bool {
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    $xrw    = $_SERVER['HTTP_X_REQUESTED_WITH'] ?? '';
    return stripos($accept, 'application/json') !== false || strcasecmp($xrw, 'XMLHttpRequest') === 0;
}

function respond(bool $ok, string $message, string $redirect): void {
    if (wants_json()) {
        http_response_code($ok ? 200 : 422);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'message' => $message, 'redirect' => $redirect]);
    } else {
        header('Location: ' . $redirect, true, 303);
    }
    exit;
}

function field(string $key, int $max = 200): string {
    $v = $_POST[$key] ?? '';
    if (!is_string($v)) return '';
    $v = trim(strip_tags($v));
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v);
    return mb_substr($v, 0, $max);
}

function one_line(string $v): string {
    return trim(preg_replace('/[\r\n]+/', ' ', $v));
}

function e(string $v): string {
    return htmlspecialchars($v, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

function rate_limited(): bool {
    $ip   = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
    $file = rtrim(sys_get_temp_dir(), '/') . '/lbphysio_' . md5($ip) . '.json';
    $now  = time();
    $hits = [];
    if (is_readable($file)) {
        $hits = json_decode((string) @file_get_contents($file), true) ?: [];
    }
    $hits = array_values(array_filter($hits, fn($t) => $t > $now - RATE_WINDOW));
    if (count($hits) >= RATE_LIMIT) return true;
    $hits[] = $now;
    @file_put_contents($file, json_encode($hits), LOCK_EX);
    return false;
}

/* ------------------------------------------------------------------
   Only accept POST
------------------------------------------------------------------- */
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Location: /contact', true, 303);
    exit;
}

$type = field('form_type', 20);
if (!in_array($type, ['appointment', 'contact', 'callback'], true)) {
    $type = 'contact';
}
$back = $type === 'contact' ? '/contact' : ($type === 'appointment' && field('page', 40) === 'appointment' ? '/appointment' : '/');

/* Spam trap: real visitors never see or fill the "website" field */
if (field('website') !== '') {
    respond(true, 'Thank you.', '/mail-success');
}

if (rate_limited()) {
    respond(false, 'Too many requests. Please wait a few minutes or WhatsApp us on 073 948 0811.', $back . '?status=server_error');
}

/* ------------------------------------------------------------------
   Read and validate
------------------------------------------------------------------- */
$name    = one_line(field('name', 100));
$email   = one_line(field('email', 150));
$phone   = one_line(field('phone', 30));
$subject = one_line(field('subject', 150));
$service = one_line(field('service', 120));
$date    = one_line(field('date', 60));
$time    = one_line(field('time', 60));
$message = field('message', 3000);

$errors = [];
if ($name === '') $errors[] = 'your name';
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'a valid email address';
if ($type === 'contact' && $email === '') $errors[] = 'your email address';
if ($type !== 'contact' && $phone === '') $errors[] = 'your phone number';
if ($phone !== '' && !preg_match('/^[0-9 +()\-]{7,20}$/', $phone)) $errors[] = 'a valid phone number';
if ($type === 'appointment' && $date === '') $errors[] = 'a preferred date';

if ($errors) {
    respond(false, 'Please provide ' . implode(', ', $errors) . '.', $back . '?status=error');
}

/* Human-friendly date (from YYYY-MM-DD) */
$dateNice = $date;
if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date) && ($ts = strtotime($date))) {
    $dateNice = date('l, j F Y', $ts);
}

/* ------------------------------------------------------------------
   Build the email
------------------------------------------------------------------- */
$titles = [
    'appointment' => 'New Appointment Request',
    'contact'     => 'New Contact Message',
    'callback'    => 'Call-Back Request',
];
$title = $titles[$type];

$subjectLine = $title . ' — ' . $name;
if ($type === 'appointment' && $service !== '') $subjectLine .= ' (' . $service . ')';
if ($type === 'contact' && $subject !== '')    $subjectLine .= ': ' . $subject;
$subjectLine = one_line($subjectLine);

$rows = [
    'Patient name'   => $name,
    'Phone'          => $phone,
    'Email'          => $email,
    'Subject'        => $type === 'contact' ? $subject : '',
    'Treatment'      => $service,
    'Preferred date' => $dateNice,
    'Preferred time' => $time,
];
$rows = array_filter($rows, fn($v) => $v !== '');

$received = date('l, j F Y \a\t H:i');
$phoneDigits = preg_replace('/[^0-9+]/', '', $phone);
$waNumber = preg_replace('/^0/', '27', ltrim($phoneDigits, '+'));

/* HTML version */
$rowsHtml = '';
foreach ($rows as $label => $value) {
    $display = e($value);
    if ($label === 'Phone')  $display = '<a href="tel:' . e($phoneDigits) . '" style="color:#258AA7;text-decoration:none;">' . e($value) . '</a>';
    if ($label === 'Email')  $display = '<a href="mailto:' . e($value) . '" style="color:#258AA7;text-decoration:none;">' . e($value) . '</a>';
    $rowsHtml .= '<tr>'
        . '<td style="padding:12px 16px;border-bottom:1px solid #EDF2F7;color:#718096;font-size:13px;width:38%;vertical-align:top;">' . e($label) . '</td>'
        . '<td style="padding:12px 16px;border-bottom:1px solid #EDF2F7;color:#1A365D;font-size:15px;font-weight:600;vertical-align:top;">' . $display . '</td>'
        . '</tr>';
}

$messageHtml = '';
if ($message !== '') {
    $label = $type === 'appointment' ? 'Notes / symptoms' : 'Message';
    $messageHtml = '<tr><td style="padding:0 32px 8px;">'
        . '<p style="margin:0 0 8px;color:#718096;font-size:13px;text-transform:uppercase;letter-spacing:.06em;">' . $label . '</p>'
        . '<div style="background:#F7FAFC;border-left:4px solid #258AA7;border-radius:6px;padding:16px 18px;color:#2D3748;font-size:15px;line-height:1.6;">'
        . nl2br(e($message)) . '</div></td></tr>';
}

$buttons = '';
if ($phoneDigits !== '') {
    $buttons .= '<a href="tel:' . e($phoneDigits) . '" style="display:inline-block;margin:4px;padding:12px 22px;background:#258AA7;color:#ffffff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">Call patient</a>';
    $buttons .= '<a href="https://wa.me/' . e($waNumber) . '" style="display:inline-block;margin:4px;padding:12px 22px;background:#25D366;color:#ffffff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">WhatsApp patient</a>';
}
if ($email !== '') {
    $buttons .= '<a href="mailto:' . e($email) . '?subject=' . rawurlencode('Re: ' . $subjectLine) . '" style="display:inline-block;margin:4px;padding:12px 22px;background:#1A365D;color:#ffffff;border-radius:8px;font-weight:600;font-size:14px;text-decoration:none;">Reply by email</a>';
}

$badgeColour = ['appointment' => '#258AA7', 'contact' => '#1A365D', 'callback' => '#DD6B20'][$type];

$html = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . e($subjectLine) . '</title></head>'
. '<body style="margin:0;padding:0;background:#EEF3F7;font-family:Segoe UI,Helvetica,Arial,sans-serif;">'
. '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF3F7;padding:28px 12px;"><tr><td align="center">'
. '<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 18px rgba(26,54,93,.08);">'
/* header */
. '<tr><td style="background:#1A365D;padding:24px 32px;">'
.   '<table role="presentation" width="100%"><tr>'
.   '<td style="vertical-align:middle;"><img src="' . SITE_URL . '/img/logo.png" width="170" alt="LB Physiotherapy" style="display:block;background:#ffffff;border-radius:8px;padding:8px 10px;"></td>'
.   '<td align="right" style="vertical-align:middle;color:#A0C4D8;font-size:12px;">Website enquiry</td>'
.   '</tr></table></td></tr>'
/* title */
. '<tr><td style="padding:28px 32px 6px;">'
.   '<span style="display:inline-block;background:' . $badgeColour . ';color:#fff;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:5px 10px;border-radius:20px;">' . e($title) . '</span>'
.   '<h1 style="margin:14px 0 4px;color:#1A365D;font-size:22px;line-height:1.3;">' . e($name) . '</h1>'
.   '<p style="margin:0;color:#718096;font-size:13px;">Received ' . e($received) . '</p>'
. '</td></tr>'
/* details */
. '<tr><td style="padding:18px 32px 20px;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #EDF2F7;border-radius:10px;border-collapse:separate;overflow:hidden;">' . $rowsHtml . '</table></td></tr>'
. $messageHtml
/* actions */
. ($buttons !== '' ? '<tr><td align="center" style="padding:18px 28px 30px;">' . $buttons . '</td></tr>' : '')
/* footer */
. '<tr><td style="background:#F7FAFC;padding:18px 32px;border-top:1px solid #EDF2F7;color:#A0AEC0;font-size:12px;line-height:1.6;">'
.   'Sent from the contact forms on <a href="' . SITE_URL . '" style="color:#258AA7;text-decoration:none;">lbphysiotherapy.co.za</a>. '
.   'Reply to this email to answer the patient directly.<br>Luyanda Buthelezi Physiotherapy · Practice No 0720001171704 · HPCSA PT 0154997'
. '</td></tr>'
. '</table></td></tr></table></body></html>';

/* Plain-text version */
$text = $title . "\n" . str_repeat('=', strlen($title)) . "\n\n";
foreach ($rows as $label => $value) {
    $text .= str_pad($label . ':', 17) . $value . "\n";
}
if ($message !== '') {
    $text .= "\n" . ($type === 'appointment' ? 'Notes / symptoms' : 'Message') . ":\n" . $message . "\n";
}
$text .= "\nReceived " . $received . "\n-- \nLB Physiotherapy website\n";

/* ------------------------------------------------------------------
   Send
------------------------------------------------------------------- */
$boundary = 'lb_' . bin2hex(random_bytes(12));

$headers   = [];
$headers[] = 'From: ' . MAIL_FROM_NAME . ' <' . MAIL_FROM . '>';
if ($email !== '') {
    $replyName = trim(preg_replace("/[^\\p{L}\\p{N} .'\\-]/u", '', $name));
    $replyName = preg_match('/[^\x20-\x7E]/', $replyName) ? '=?UTF-8?B?' . base64_encode($replyName) . '?=' : '"' . $replyName . '"';
    $headers[] = 'Reply-To: ' . $replyName . ' <' . $email . '>';
}
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: multipart/alternative; boundary="' . $boundary . '"';
$headers[] = 'X-Mailer: LB Physiotherapy Website';

$body  = "This is a multi-part message in MIME format.\r\n\r\n";
$body .= "--{$boundary}\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($text)) . "\r\n";
$body .= "--{$boundary}\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n";
$body .= chunk_split(base64_encode($html)) . "\r\n";
$body .= "--{$boundary}--\r\n";

$encodedSubject = '=?UTF-8?B?' . base64_encode($subjectLine) . '?=';
$to = MAIL_TO_NAME !== '' ? '"' . MAIL_TO_NAME . '" <' . MAIL_TO . '>' : MAIL_TO;

$sent = @mail($to, $encodedSubject, $body, implode("\r\n", $headers), '-f' . MAIL_FROM);

if ($sent) {
    respond(true, 'Thank you. Your request has been sent.', '/mail-success');
}
respond(false, "Sorry, your message couldn't be sent. Please WhatsApp us on 073 948 0811.", $back . '?status=server_error');
