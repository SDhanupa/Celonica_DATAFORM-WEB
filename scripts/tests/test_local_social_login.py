"""Provisioning guards: invalid credentials must not contact or change Keycloak."""
import contextlib
import importlib.util
import io
import json
from pathlib import Path
import tempfile
import sys
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parents[1]))

spec = importlib.util.spec_from_file_location('local_social_login', Path(__file__).parents[1] / 'setup-local-social-login.py')
setup = importlib.util.module_from_spec(spec)
spec.loader.exec_module(setup)


class CredentialGuards(unittest.TestCase):
    def setUp(self):
        self.directory = tempfile.TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        self.root = Path(self.directory.name)
        (self.root / '.local').mkdir()
        self.root_patch = patch.object(setup, 'ROOT', self.root)
        self.root_patch.start()
        self.addCleanup(self.root_patch.stop)

    def write(self, filename, value):
        (self.root / '.local' / filename).write_text(json.dumps(value), encoding='utf-8')

    def rejected(self):
        output = io.StringIO()
        with patch.object(setup, 'Keycloak') as kc, patch('sys.argv', ['setup']), contextlib.redirect_stdout(output):
            self.assertEqual(setup.main(), 2)
            kc.assert_not_called()
        return output.getvalue()

    def test_missing_files_do_not_contact_keycloak(self):
        self.assertIn('No Keycloak settings changed', self.rejected())

    def test_empty_secrets_do_not_contact_keycloak(self):
        self.write('google-oauth.json', {'client_id': '', 'client_secret': '', 'redirect_uri': setup.CALLBACK})
        self.write('sms-textware.json', {'username': '', 'password': '', 'sender_id': ''})
        self.assertIn('client_secret', self.rejected())

    def test_hosted_callback_is_rejected_without_logging_secrets(self):
        self.write('google-oauth.json', {'client_id': 'test.apps.googleusercontent.com',
            'client_secret': 'PRIVATE-TEST-VALUE', 'redirect_uri': 'https://ceystem.com/callback'})
        self.write('sms-textware.json', {'username': 'test', 'password': 'PRIVATE-SMS-VALUE', 'sender_id': 'test'})
        output = self.rejected()
        self.assertIn('redirect_uri must be', output)
        self.assertNotIn('PRIVATE', output)

    def test_invalid_json_is_rejected_without_disclosing_content(self):
        (self.root / '.local/google-oauth.json').write_text('PRIVATE-INCOMPLETE-JSON')
        self.assertNotIn('PRIVATE', self.rejected())


if __name__ == '__main__':
    unittest.main()
