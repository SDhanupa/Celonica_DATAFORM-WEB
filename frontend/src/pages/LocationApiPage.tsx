import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Divider, LinearProgress, MenuItem, Paper, Stack, TextField, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ContentCopyOutlined, KeyOutlined, RefreshOutlined } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';

interface AccessKey { id: number; name: string; prefix: string; scope: string; expires_at: string | null; revoked_at: string | null; last_used_at: string | null; request_count: number }
const date = (value: string | null) => value ? new Date(value).toLocaleString() : 'Not used yet';
const status = (key: AccessKey) => key.revoked_at ? 'Revoked' : key.expires_at && new Date(key.expires_at).getTime() <= Date.now() ? 'Expired' : 'Active';
const expiryOptions = [0, 7, 30, 90];
const expiryLabel = (days: number) => days === 0 ? 'Never expires' : `${days} days`;
const panel = { p: { xs: 2, md: 3 }, borderRadius: '24px', minWidth: 0 };

export default function LocationApiPage() {
  const { getToken, isAuthenticated } = useAuth();
  const [keys, setKeys] = useState<AccessKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [name, setName] = useState('');
  const [days, setDays] = useState(30);
  const [saving, setSaving] = useState(false);
  const [secret, setSecret] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState('');
  const [revoke, setRevoke] = useState<AccessKey | null>(null);
  const [editingExpiry, setEditingExpiry] = useState<AccessKey | null>(null);
  const [expiryDays, setExpiryDays] = useState(0);
  const [expiryError, setExpiryError] = useState('');
  const [mode, setMode] = useState('code');
  const [code, setCode] = useState('RATPA');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [preview, setPreview] = useState<unknown>(null);
  const [previewError, setPreviewError] = useState('');
  const [testing, setTesting] = useState(false);
  const base = `${window.location.origin}/api/v1`;
  const example = `curl "${base}/gn/RATPA" \\\n  -H "Authorization: Bearer $CEYLONICA_API_KEY" \\\n  -H "Accept: application/json"`;
  const request = useCallback(async (path: string, init?: RequestInit) => {
    const token = await getToken();
    if (!token) throw new Error('Your session has expired. Sign in again to manage API access.');
    const response = await fetch(`/api/admin/location-api/${path}`, { ...init,
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json', 'Content-Type': 'application/json' } });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || result.error || 'The request failed. Try again.');
    return result;
  }, [getToken]);
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true); setError('');
    try { const result = await request('keys', { signal }); if (!signal?.aborted) { setKeys(result.data); setLoaded(true); } }
    catch (reason) { if (!signal?.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load access keys.'); }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [request]);
  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController(); void load(controller.signal);
    return () => controller.abort();
  }, [isAuthenticated, load]);
  async function create(event: React.FormEvent) {
    event.preventDefault(); setSaving(true); setError(''); setNotice('');
    try {
      const result = await request('keys', { method: 'POST', body: JSON.stringify({ name: name.trim(), expires_in_days: days }) });
      setKeys(previous => [result.data, ...previous]); setName(''); setCopied(false); setRevealed(false); setCopyError(''); setSecret(result.secret);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to create key.'); }
    finally { setSaving(false); }
  }
  async function confirmRevoke() {
    if (!revoke) return;
    setSaving(true); setError('');
    try {
      await request(`keys/${revoke.id}/revoke`, { method: 'POST' });
      setKeys(previous => previous.map(key => key.id === revoke.id ? { ...key, revoked_at: new Date().toISOString() } : key));
      setNotice(`Access for ${revoke.name} has been revoked.`); setRevoke(null);
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Unable to revoke key.'); setRevoke(null); }
    finally { setSaving(false); }
  }
  async function saveExpiry(event: React.FormEvent) {
    event.preventDefault(); if (!editingExpiry) return;
    setSaving(true); setExpiryError('');
    try {
      const result = await request(`keys/${editingExpiry.id}/expiry`, { method: 'PATCH', body: JSON.stringify({ expires_in_days: expiryDays }) });
      setKeys(previous => previous.map(key => key.id === result.data.id ? result.data : key));
      setNotice(`Expiry updated for ${editingExpiry.name}. The existing key stays the same.`); setEditingExpiry(null);
    } catch (reason) { setExpiryError(reason instanceof Error ? reason.message : 'Unable to change expiry. Try again.'); }
    finally { setSaving(false); }
  }
  async function test(event: React.FormEvent) {
    event.preventDefault(); setTesting(true); setPreview(null); setPreviewError('');
    const query = new URLSearchParams(mode === 'code' ? { code: code.trim() } : { lat, lng });
    try { setPreview((await request(`preview?${query}`)).data); }
    catch (reason) { setPreviewError(reason instanceof Error ? reason.message : 'Unable to look up this location.'); }
    finally { setTesting(false); }
  }
  return <Box>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', mb: 3 }}>
      <Box><Typography component="h1" variant="h4" sx={{ mb: 0.75 }}>Location API</Typography><Typography color="text.secondary">Connect another project to Ceylonica’s GN codes and location hierarchy.</Typography></Box>
      <Chip icon={<KeyOutlined />} label="Read-only · GN data" color="primary" variant="outlined" />
    </Box>
    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
    {notice && <Alert severity="success" onClose={() => setNotice('')} sx={{ mb: 2 }}>{notice}</Alert>}
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'minmax(0, 1.2fr) minmax(0, 1fr)' }, alignItems: 'start', gap: 3 }}>
      <Paper sx={panel}>
        <Typography component="h2" variant="h6">Project access</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Create a separate key for each project. Choose an expiry date or keep access until you revoke it.</Typography>
        <Box component="form" onSubmit={create} sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', alignItems: 'start' }}>
          <TextField label="Project name" placeholder="Plant Mobile App backend" value={name} onChange={event => setName(event.target.value)} required inputProps={{ maxLength: 80 }} size="small" sx={{ flex: '1 1 210px' }} disabled={saving} />
          <TextField select label="Expiry" value={days} onChange={event => setDays(Number(event.target.value))} size="small" sx={{ minWidth: 150 }} disabled={saving}>{expiryOptions.map(value => <MenuItem key={value} value={value}>{expiryLabel(value)}</MenuItem>)}</TextField>
          <Button type="submit" variant="contained" disabled={saving || !name.trim() || !loaded} startIcon={<KeyOutlined />}>{saving ? 'Saving…' : 'Create key'}</Button>
        </Box>
        {days === 0 && <Alert severity="info" sx={{ mt: 2 }}>This key stays valid until revoked. Anyone who obtains it can read GN location data; revoke it if it is exposed.</Alert>}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>60 requests per minute per key. The secret is shown only once.</Typography>
        <Divider sx={{ my: 3 }} />
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}><Typography component="h3" variant="subtitle1">Access keys{loaded ? ` (${keys.length})` : ''}</Typography><Button startIcon={<RefreshOutlined />} onClick={() => void load()} disabled={loading || saving}>Refresh</Button></Stack>
        {loading && <LinearProgress aria-label="Loading access keys" />}
        {!loading && !loaded && <Typography color="text.secondary" sx={{ py: 2 }}>Keys could not be loaded. Use Refresh to try again.</Typography>}
        {loaded && !keys.length && <Box sx={{ py: 3 }}><Typography>No project has API access yet.</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Create a key above when your other project is ready to connect.</Typography></Box>}
        {keys.map(key => <Box key={key.id} sx={{ py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}><Typography sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{key.name}</Typography><Chip size="small" label={status(key)} color={status(key) === 'Active' ? 'success' : 'default'} variant="outlined" /></Stack>
          <Typography component="code" variant="body2" sx={{ display: 'block', mt: 0.75 }}>{key.prefix}…</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>{key.expires_at ? `Expires ${date(key.expires_at)}` : 'Never expires · valid until revoked'}</Typography>
          <Typography variant="caption" color="text.secondary">Last request: {date(key.last_used_at)} · {Number(key.request_count).toLocaleString()} authenticated requests</Typography>
          {status(key) === 'Active' && <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}><Button size="small" disabled={saving} onClick={() => { setEditingExpiry(key); setExpiryDays(key.expires_at ? 30 : 0); setExpiryError(''); }} aria-label={`Change expiry for ${key.name}`}>Change expiry</Button><Button color="error" size="small" disabled={saving} onClick={() => setRevoke(key)} aria-label={`Revoke access for ${key.name}`}>Revoke access</Button></Stack>}
        </Box>)}
      </Paper>
      <Paper sx={panel}>
        <Typography component="h2" variant="h6">Preview location data</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>See the data your integration receives. This preview uses your admin session; no API key is needed.</Typography>
        <ToggleButtonGroup exclusive value={mode} onChange={(_, value) => { if (value) { setMode(value); setPreview(null); setPreviewError(''); } }} size="small" aria-label="Lookup method" sx={{ mb: 2 }}><ToggleButton value="code" disabled={testing}>GN code</ToggleButton><ToggleButton value="coordinates" disabled={testing}>Coordinates</ToggleButton></ToggleButtonGroup>
        <Box component="form" onSubmit={test}>
          {mode === 'code' ? <TextField fullWidth label="GN code or CCODE" helperText="For example, RATPA for Pahalagama" value={code} onChange={event => { setCode(event.target.value); setPreview(null); }} inputProps={{ maxLength: 30 }} required size="small" disabled={testing} /> : <Stack direction={{ xs: 'column', sm: 'row' }} gap={2}>
            <TextField fullWidth label="Latitude" type="number" value={lat} onChange={event => { setLat(event.target.value); setPreview(null); }} inputProps={{ min: -90, max: 90, step: 'any' }} required size="small" disabled={testing} />
            <TextField fullWidth label="Longitude" type="number" value={lng} onChange={event => { setLng(event.target.value); setPreview(null); }} inputProps={{ min: -180, max: 180, step: 'any' }} required size="small" disabled={testing} />
          </Stack>}
          <Button type="submit" variant="outlined" disabled={testing || (mode === 'code' && !code.trim())} sx={{ mt: 2 }}>{testing ? 'Looking up…' : 'Look up location'}</Button>
        </Box>
        {previewError && <Alert severity="warning" sx={{ mt: 2 }}>{previewError}</Alert>}
        {preview !== null && <Box sx={{ mt: 2 }}><Typography variant="subtitle2" role="status">API response</Typography><Box component="pre" tabIndex={0} aria-label="Location API response" sx={{ m: 0, mt: 1, p: 2, bgcolor: 'background.default', borderRadius: '12px', overflow: 'auto', maxHeight: 380, fontSize: 12, lineHeight: 1.7 }}>{JSON.stringify({ data: preview }, null, 2)}</Box></Box>}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Coordinate lookup uses local GN boundaries. Unmatched or ambiguous locations return 404; village names are never guessed.</Typography>
      </Paper>
    </Box>
    <Paper sx={{ ...panel, mt: 3 }}>
      <Typography component="h2" variant="h6">Connect your project</Typography>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75, maxWidth: '75ch' }}>Store the key on your other project’s backend as an environment secret. Your mobile app calls that backend. Do not put this key in a Flutter app, browser bundle or Git repository.</Typography>
      <Typography variant="body2" sx={{ mt: 2, overflowWrap: 'anywhere' }}><strong>Base URL:</strong> {base}</Typography><Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>For deployment, use your hosted HTTPS URL. Localhost works only on this computer.</Typography>
      <Box component="pre" tabIndex={0} aria-label="Example API request" sx={{ p: 2, bgcolor: 'background.default', borderRadius: '12px', overflow: 'auto', fontSize: 13, lineHeight: 1.8 }}>{example}</Box>
      <Stack spacing={1} sx={{ mt: 2, overflowWrap: 'anywhere' }}>
        <Typography variant="body2"><strong>GET /gn/&#123;code&#125;</strong> — GN name, CCODE, official code, province, district and division.</Typography>
        <Typography variant="body2"><strong>GET /locations/resolve?lat=&#123;latitude&#125;&amp;lng=&#123;longitude&#125;</strong> — coordinates and the matching GN.</Typography>
        <Typography variant="body2" color="text.secondary">401: invalid, expired or revoked key · 403: scope denied · 404: no unique match · 422: invalid input · 429: rate limit (retry after the Retry-After header).</Typography>
        <Typography variant="body2" color="text.secondary">These keys cannot edit records, read personal data or access admin tools. To rotate a key, create a replacement, update the other project, then revoke the old key.</Typography>
      </Stack>
    </Paper>
    <Dialog open={Boolean(secret)} maxWidth="sm" fullWidth aria-labelledby="new-api-key-title">
      <DialogTitle id="new-api-key-title">Save your API key</DialogTitle>
      <DialogContent><Typography sx={{ mb: 2 }}>This secret cannot be retrieved after closing. Save it in your project’s backend environment.</Typography><TextField fullWidth label="New API key" type={revealed ? 'text' : 'password'} value={secret} InputProps={{ readOnly: true }} inputProps={{ autoComplete: 'off', spellCheck: false }} />
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1 }}><Button onClick={() => setRevealed(value => !value)}>{revealed ? 'Hide key' : 'Reveal key'}</Button><Button startIcon={<ContentCopyOutlined />} onClick={async () => { try { await navigator.clipboard.writeText(secret); setCopied(true); setCopyError(''); } catch { setCopyError('Clipboard unavailable. Reveal the key and copy it manually.'); } }}>{copied ? 'Copied' : 'Copy key'}</Button></Stack>
        {copyError && <Alert severity="warning" sx={{ mt: 1 }}>{copyError}</Alert>}
      </DialogContent><DialogActions><Button variant="contained" onClick={() => { setSecret(''); setRevealed(false); }}>I’ve saved my key</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(revoke)} onClose={() => { if (!saving) setRevoke(null); }} aria-labelledby="revoke-api-title">
      <DialogTitle id="revoke-api-title">Revoke project access?</DialogTitle><DialogContent><Typography>{revoke?.name} will stop receiving location data with this key. You can create a new key later.</Typography></DialogContent>
      <DialogActions><Button disabled={saving} onClick={() => setRevoke(null)}>Cancel</Button><Button color="error" variant="contained" disabled={saving} onClick={() => void confirmRevoke()}>{saving ? 'Revoking…' : 'Revoke key'}</Button></DialogActions>
    </Dialog>
    <Dialog open={Boolean(editingExpiry)} onClose={() => { if (!saving) setEditingExpiry(null); }} aria-labelledby="expiry-api-title" maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={saveExpiry}>
        <DialogTitle id="expiry-api-title">Change key expiry</DialogTitle>
        <DialogContent><Typography sx={{ mb: 2, overflowWrap: 'anywhere' }}>{editingExpiry?.name} keeps its current key. A timed expiry starts from when you save.</Typography>
          <TextField fullWidth select label="New expiry" value={expiryDays} onChange={event => setExpiryDays(Number(event.target.value))} disabled={saving} sx={{ mt: 1 }}>{expiryOptions.map(value => <MenuItem key={value} value={value}>{expiryLabel(value)}</MenuItem>)}</TextField>
          {expiryDays === 0 && <Alert severity="info" sx={{ mt: 2 }}>Access will continue until you revoke this key, including if someone else obtains a copy.</Alert>}
          {expiryError && <Alert severity="error" sx={{ mt: 2 }}>{expiryError}</Alert>}
        </DialogContent>
        <DialogActions><Button disabled={saving} onClick={() => setEditingExpiry(null)}>Cancel</Button><Button type="submit" variant="contained" disabled={saving}>{saving ? 'Saving…' : 'Save expiry'}</Button></DialogActions>
      </Box>
    </Dialog>
  </Box>;
}
