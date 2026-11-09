<?php

namespace App\Services\Warranty;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\Process\Process;
use ZipArchive;

class DocumentAutofill
{
    public function extract(string $path, string $mime): array
    {
        $source = Storage::disk('local')->path($path);
        $temporary = sys_get_temp_dir().'/alaska-warranty-'.bin2hex(random_bytes(16));
        try {
            if (! mkdir($temporary, 0700)) {
                throw new \RuntimeException('Unable to prepare private document extraction.');
            }
            $text = match ($mime) {
                'application/pdf' => $this->pdf($source, $temporary),
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document' => $this->docx($source),
                'text/plain' => file_get_contents($source, false, null, 0, 65000),
                default => $this->command(['tesseract', $source, 'stdout', '-l', 'eng', '--psm', '6']),
            };
            $fields = $this->fields(mb_substr($text, 0, 65000));

            return ['fields' => $fields, 'status' => $fields ? 'suggestions' : 'no_fields', 'message' => $fields ? 'Suggested values were read from the file. Verify every value, then complete any missing fields.' : 'No reliable form fields were found. You can fill the form manually; your file will still be attached.'];
        } catch (\Throwable $e) {
            report($e);

            return ['fields' => [], 'status' => 'unavailable', 'message' => 'Autofill could not read this file. Fill the form manually; your file will still be attached.'];
        } finally {
            foreach (glob($temporary.'/*') ?: [] as $file) {
                unlink($file);
            }
            if (is_dir($temporary)) {
                rmdir($temporary);
            }
        }
    }

    private function command(array $arguments): string
    {
        $process = new Process($arguments, null, ['OMP_THREAD_LIMIT' => '1']);
        $process->setTimeout((int) config('warranty.ocr_timeout', 20));
        $process->mustRun();

        return $process->getOutput();
    }

    private function pdf(string $source, string $temporary): string
    {
        $pages = (string) config('warranty.pdf_pages', 3);
        $text = $this->command(['pdftotext', '-f', '1', '-l', $pages, '-layout', $source, '-']);
        if (mb_strlen(trim($text)) >= 40) {
            return $text;
        }
        $this->command(['pdftoppm', '-f', '1', '-l', $pages, '-scale-to', '2200', '-png', $source, $temporary.'/page']);
        foreach (glob($temporary.'/page-*.png') ?: [] as $image) {
            $text .= "\n".$this->command(['tesseract', $image, 'stdout', '-l', 'eng', '--psm', '6']);
        }

        return $text;
    }

    private function docx(string $source): string
    {
        $zip = new ZipArchive;
        if ($zip->open($source) !== true) {
            throw new \RuntimeException('Unreadable DOCX.');
        }
        try {
            $stat = $zip->statName('word/document.xml');
            if (! $stat || $stat['size'] > 2 * 1024 * 1024 || $zip->numFiles > 2000) {
                throw new \RuntimeException('DOCX exceeds safe extraction limits.');
            }
            $xml = $zip->getFromName('word/document.xml');
            if (str_contains($xml, '<!DOCTYPE') || str_contains($xml, '<!ENTITY')) {
                throw new \RuntimeException('Unsupported DOCX XML.');
            }
            $document = new \DOMDocument;
            if (! @$document->loadXML($xml, LIBXML_NONET)) {
                throw new \RuntimeException('Invalid DOCX XML.');
            }
            $xpath = new \DOMXPath($document);
            $xpath->registerNamespace('w', 'http://schemas.openxmlformats.org/wordprocessingml/2006/main');
            $lines = [];
            foreach ($xpath->query('//w:p') as $paragraph) {
                $lines[] = $paragraph->textContent;
            }

            return implode("\n", $lines);
        } finally {
            $zip->close();
        }
    }

    public function fields(string $text): array
    {
        $labels = [
            'name' => '(?:customer\s+name|full\s+name|name)', 'phone' => '(?:customer\s+)?(?:phone(?:\s*/\s*whatsapp)?|mobile|telephone)',
            'email' => '(?:customer\s+)?e-?mail(?:\s+address)?', 'city' => '(?:customer\s+)?city',
            'product_model' => '(?:product\s+model|battery\s+model|model(?:\s+number)?)', 'product_type' => '(?:product\s+type|battery\s+type)',
            'serial_number' => '(?:battery\s+code(?:\s*/\s*serial\s*no\.?)?|serial(?:\s+number|\s+no\.?)?)',
            'card_number' => '(?:warranty\s+card(?:\s+number|\s+no\.?)?|card\s+number)',
            'purchase_date' => '(?:date\s+of\s+purchase|purchase\s+date|purchased\s+on)', 'dealer' => '(?:dealer(?:\s*/\s*shop)?|bought\s+from(?:\s*\([^)]*\))?|shop)',
            'registration_reference' => '(?:warranty\s+reference|registration\s+reference)', 'usage' => '(?:used\s+in|usage|vehicle\s*/\s*system)',
            'issue' => '(?:problem|issue)', 'description' => '(?:problem\s+description|description)', 'problem_started_on' => '(?:problem\s+started(?:\s+on)?|date\s+problem\s+started)',
        ];
        $result = [];
        $text = str_replace(["\r\n", "\r", "\f"], "\n", $text);
        foreach ($labels as $key => $pattern) {
            if (preg_match('~^\h*'.$pattern.'\h*[:\-]\h*(.+)$~imu', $text, $match)) {
                $value = trim($match[1]);
                if ($value !== '') {
                    $result[$key] = mb_substr($value, 0, $key === 'description' ? 1200 : 255);
                }
            }
        }
        foreach (['purchase_date', 'problem_started_on'] as $key) {
            if (isset($result[$key])) {
                $date = $this->date($result[$key]);
                if ($date) {
                    $result[$key] = $date;
                } else {
                    unset($result[$key]);
                }
            }
        }
        if (isset($result['email']) && ! filter_var($result['email'], FILTER_VALIDATE_EMAIL)) {
            unset($result['email']);
        }
        if (isset($result['product_type'])) {
            $value = $result['product_type'];
            $type = match (true) {
                (bool) preg_match('/lithium|lifepo|life\s*series/i', $value) => 'lithium-ion',
                (bool) preg_match('/inverter/i', $value) => 'inverter',
                (bool) preg_match('/maintenance|\bMF\b/i', $value) => 'maintenance-free',
                (bool) preg_match('/dry|lead.?acid/i', $value) => 'dry-charge', default => null,
            };
            if ($type) {
                $result['product_type'] = $type;
            } else {
                unset($result['product_type']);
            }
        }
        if (isset($result['issue']) && ! in_array($result['issue'], config('warranty.issues'), true)) {
            unset($result['issue']);
        }

        return $result;
    }

    private function date(string $value): ?string
    {
        foreach (['Y-m-d', 'Y/m/d', 'd M Y', 'd F Y'] as $format) {
            try {
                $date = CarbonImmutable::createFromFormat('!'.$format, $value);
                if ($date && strcasecmp($date->format($format), $value) === 0) {
                    return $date->format('Y-m-d');
                }
            } catch (\Throwable) {
            }
        }

        // Ambiguous dates such as 03/04/2026 must be entered/confirmed manually.
        return null;
    }
}
