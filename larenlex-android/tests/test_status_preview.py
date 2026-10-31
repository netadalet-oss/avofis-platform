"""No network required: LarenLex status preview is explicitly a prototype."""
from html.parser import HTMLParser
from pathlib import Path
import unittest

DOC = Path(__file__).resolve().parents[1] / 'preview/status.html'


class ReadPage(HTMLParser):
    def __init__(self):
        super().__init__()
        self.section = 0
        self.sections = []
        self.headers = []
        self.in_h2 = False

    def handle_starttag(self, tag, attrs):
        if tag == 'section':
            self.section += 1
            self.sections.append([])
        if tag == 'h2':
            self.in_h2 = True

    def handle_data(self, data):
        if self.section:
            self.sections[-1].append(data)
        if self.in_h2 and data.strip():
            self.headers.append(data.strip())

    def handle_endtag(self, tag):
        if tag == 'section':
            self.section -= 1
        if tag == 'h2':
            self.in_h2 = False


class StatusPreviewTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.page = DOC.read_text(encoding='utf-8')
        cls.parser = ReadPage()
        cls.parser.feed(cls.page)

    def test_four_required_section_labels(self):
        self.assertEqual(self.parser.headers,
                         ['Bu dönem ne değişti?', 'Şimdi neredeyiz?',
                          'Sırada ne var?', 'Önemli sınır'])

    def test_public_section_copy_within_policy(self):
        words = sum(len(' '.join(section).split()) for section in self.parser.sections)
        self.assertGreaterEqual(words, 80)
        self.assertLessEqual(words, 130)

    def test_is_explicitly_unreleased_prototype(self):
        self.assertIn('Tasarım prototipi', self.page)
        self.assertIn('üretim yayını değildir', self.page)
        self.assertIn('Bağımsız Android Git', self.page)

    def test_mobile_viewport_and_accessibility(self):
        for value in ('name="viewport"', 'aria-labelledby=', 'role="status"',
                      'prefers-reduced-motion', 'grid-template-columns: 1fr'):
            self.assertIn(value, self.page)

    def test_no_external_requests_or_script(self):
        for value in ('<script', '<iframe', 'https://', 'http://', 'form action='):
            self.assertNotIn(value, self.page)


if __name__ == '__main__':
    unittest.main()
