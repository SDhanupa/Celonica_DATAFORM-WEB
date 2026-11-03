import React, { useCallback, useEffect, useState } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Alert, Box, Button, Chip, CircularProgress, InputAdornment, LinearProgress, Paper,
  Tab, Tabs, TextField, Typography, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/material';
import { ArrowForward, ExpandMore, Refresh, Search } from '@mui/icons-material';
import { useAuth } from '../auth/AuthProvider';
import { matchesAdminTool, toolGroups, unavailableAdminModules, visibleAdminTools } from '../config/adminTools';
import AdminsPage from './AdminsPage';
import LocationApiPage from './LocationApiPage';

interface Collection {
  slug: string; name: string; records: number; pending: number | null; manageable: boolean;
}
interface WorkspaceSummary {
  totals: Record<string, number | null>;
  queues: Record<string, number | null>;
  collections: Collection[];
  updatedAt: string;
}
const formatCount = (value: number | null | undefined) => typeof value === 'number' ? value.toLocaleString() : '—';
const panel = { p: { xs: 2, md: 3 }, borderRadius: '24px' };
const queueItems = [
  { key: 'categoryResponses', title: 'Category responses', detail: 'Pending category form submissions', path: '/approvals' },
  { key: 'placeProposals', title: 'Place submissions', detail: 'Unapproved places and proposed updates', path: '/user-submissions' },
  { key: 'gnAnswers', title: 'GN answers', detail: 'Pending rapid-fire village answers', path: '/admin/rapid-fire-approvals' },
  { key: 'industrySurveys', title: 'Industry surveys', detail: 'Submitted surveys awaiting approval', path: '/admin/industry-surveys' },
];

const AdminWorkspacePage: React.FC = () => {
  const { getToken, isAuthenticated, userInfo } = useAuth();
  const [params, setParams] = useSearchParams();
  const requestedView = params.get('view');
  const view = ['tools', 'data', 'accounts', 'api'].includes(requestedView || '') ? requestedView! : 'overview';
  const [summary, setSummary] = useState<WorkspaceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('All');
  const [collectionSearch, setCollectionSearch] = useState('');
  const [collectionStatus, setCollectionStatus] = useState('All');
  const [revision, setRevision] = useState(0);
  const tools = visibleAdminTools(userInfo?.realm_roles || []);
  const filteredTools = tools.filter(tool => matchesAdminTool(tool, search, group));
  const changeView = useCallback((next: string) => {
    setParams(next === 'overview' ? {} : { view: next });
  }, [setParams]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const controller = new AbortController();
    setLoading(true); setError('');
    getToken().then(bearer => {
      if (!bearer) throw new Error('Your session could not be refreshed. Sign in again to load workspace data.');
      return fetch('/api/admin/workspace', {
        headers: { Authorization: `Bearer ${bearer}`, Accept: 'application/json' },
        signal: controller.signal,
      });
    }).then(async response => {
      if (!response.ok) throw new Error('Unable to load workspace data. Refresh to try again.');
      const result = await response.json();
      if (!result.totals || !result.queues || !Array.isArray(result.collections)) throw new Error('The workspace response is incomplete. Refresh to try again.');
      if (!controller.signal.aborted) setSummary(result);
    }).catch(reason => {
      if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : 'Unable to load workspace data.');
    }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [getToken, isAuthenticated, revision]);

  const collections = (summary?.collections || []).filter(item =>
    `${item.name} ${item.slug}`.toLowerCase().includes(collectionSearch.trim().toLowerCase()) &&
    (collectionStatus === 'All' || (collectionStatus === 'With records' ? item.records > 0 : collectionStatus === 'Needs review' ? (item.pending ?? 0) > 0 : item.records === 0)));

  return <Box>
    {view !== 'accounts' && view !== 'api' && <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
      <Box><Typography component="h1" variant="h4" sx={{ mb: 0.75 }}>Admin workspace</Typography>
        <Typography color="text.secondary">Manage village data, review contributions and find every working tool.</Typography></Box>
      <Button variant="outlined" startIcon={<Refresh />} disabled={loading} onClick={() => setRevision(value => value + 1)}>Refresh data</Button>
    </Box>}
    <Tabs value={view} onChange={(_, next) => changeView(next)} aria-label="Admin workspace sections" variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
      sx={{ mb: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
      {[['overview', 'Overview'], ['tools', 'All tools'], ['data', 'Data collections'], ['api', 'Location API'], ['accounts', 'Administrators']].map(([value, label]) =>
        <Tab key={value} value={value} label={label} id={`workspace-tab-${value}`} aria-controls={`workspace-panel-${value}`} />)}
    </Tabs>
    <Box role="tabpanel" id={`workspace-panel-${view}`} aria-labelledby={`workspace-tab-${view}`}>
      {view === 'accounts' ? <AdminsPage /> : view === 'api' ? <LocationApiPage /> : <>
        {error && <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" onClick={() => setRevision(value => value + 1)}>Retry</Button>}>{error}{summary ? ' The previous summary is shown below.' : ''}</Alert>}
        {loading && <LinearProgress aria-label="Loading workspace data" sx={{ mb: 2 }} />}

        {view === 'overview' && <>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
            {[
              { label: 'GN divisions', key: 'gnDivisions', path: '/grama-niladharis' },
              { label: 'Categories', key: 'categories', path: '/categories' },
              { label: 'Questions', key: 'questions', path: '/questions' },
              { label: 'Industry surveys', key: 'industrySurveys', path: '/admin/industry-surveys' },
            ].map((metric, index) => <Paper key={metric.key} elevation={0} sx={{ ...panel, bgcolor: index === 0 ? 'primary.main' : 'background.paper', color: index === 0 ? '#fff' : 'text.primary' }}>
              <Typography variant="body2" sx={{ color: 'inherit', mb: 2 }}>{metric.label}</Typography>
              <Typography sx={{ color: 'inherit', fontVariantNumeric: 'tabular-nums', fontSize: { xs: 28, sm: 36 }, fontWeight: 500 }}>{formatCount(summary?.totals[metric.key])}</Typography>
              <Button component={RouterLink} to={metric.path} aria-label={`View ${metric.label.toLowerCase()}`} endIcon={<ArrowForward sx={{ fontSize: 16 }} />} sx={{ color: 'inherit', p: 0, minWidth: 0, mt: 1 }}>View records</Button>
            </Paper>)}
          </Box>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr' }, gap: 3, mb: 3 }}>
            <Paper elevation={0} sx={panel}>
              <Typography component="h2" variant="h5">Review queues</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Open a queue to inspect submissions before making changes.</Typography>
              {queueItems.map(item => <Box key={item.key} sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ flex: 1 }}><Button component={RouterLink} to={item.path} sx={{ p: 0, justifyContent: 'flex-start', minHeight: 30 }}>{item.title}</Button><Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{item.detail}</Typography></Box>
                <Chip label={formatCount(summary?.queues[item.key])} aria-label={`${item.title}: ${formatCount(summary?.queues[item.key])} pending`} sx={{ minWidth: 40, bgcolor: (summary?.queues[item.key] ?? 0) > 0 ? '#fff2d8' : '#edf4ee', color: '#4b544d' }} />
              </Box>)}
            </Paper>
            <Paper elevation={0} sx={panel}>
              <Typography component="h2" variant="h5">Data & access</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Counts from the current database.</Typography>
              {[
                ['Category collections', summary ? summary.collections.length : null],
                ['Stored category records', summary ? summary.collections.reduce((sum, collection) => sum + collection.records, 0) : null],
                ['Registered user records', summary?.totals.users],
                ['Administrator accounts', summary?.totals.administrators],
              ].map(([label, value]) => <Box key={String(label)} sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider' }}><Typography variant="body2" color="text.secondary">{label}</Typography><Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{formatCount(value as number | null | undefined)}</Typography></Box>)}
              <Button onClick={() => changeView('data')} endIcon={<ArrowForward />} sx={{ px: 0, mt: 1 }}>Browse data collections</Button>
            </Paper>
          </Box>
          <Paper elevation={0} sx={panel}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}><Typography component="h2" variant="h5">Common tasks</Typography><Button onClick={() => changeView('tools')} endIcon={<ArrowForward />}>All {tools.length} tools</Button></Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}>
              {['bulk', 'industry-builder', 'categories', 'gns', 'admins', 'map'].map(id => tools.find(tool => tool.id === id)).filter(Boolean).map(tool => <Box key={tool!.id} sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.5 }}><Button component={RouterLink} to={tool!.path} sx={{ px: 0, justifyContent: 'flex-start' }}>{tool!.title}</Button><Typography variant="body2" color="text.secondary">{tool!.description}</Typography></Box>)}
            </Box>
          </Paper>
        </>}

        {view === 'tools' && <>
          <TextField fullWidth size="small" label="Search tools or tags" value={search} onChange={event => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }} sx={{ bgcolor: 'background.paper', mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }} aria-label="Filter tools by group">
            {['All', ...toolGroups].map(item => <Chip key={item} label={item} onClick={() => setGroup(item)} aria-pressed={group === item} color={group === item ? 'primary' : 'default'} variant={group === item ? 'filled' : 'outlined'} />)}
          </Box>
          <Typography variant="body2" color="text.secondary" aria-live="polite" sx={{ mb: 2 }}>{filteredTools.length} {filteredTools.length === 1 ? 'tool matches' : 'tools match'} your filters</Typography>
          {!filteredTools.length && <Paper elevation={0} sx={panel}><Typography>No matching tools. Try a different name or tag.</Typography><Button onClick={() => { setSearch(''); setGroup('All'); }}>Clear filters</Button></Paper>}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 3, alignItems: 'start' }}>
            {toolGroups.map(item => {
              const items = filteredTools.filter(tool => tool.group === item);
              return items.length ? <Paper key={item} elevation={0} sx={panel}><Typography component="h2" variant="h5" sx={{ mb: 1 }}>{item}</Typography>
                {items.map(tool => <Box key={tool.id} sx={{ py: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Button component={RouterLink} to={tool.path} endIcon={<ArrowForward sx={{ fontSize: 17 }} />} sx={{ px: 0, justifyContent: 'space-between', width: '100%', textAlign: 'left' }}>{tool.title}</Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>{tool.description}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75 }}>{tool.tags.map(tag => <Chip key={tag} label={tag} size="small" variant="outlined" />)}</Box>
                </Box>)}
              </Paper> : null;
            })}
          </Box>
          <Accordion disableGutters elevation={0} sx={{ mt: 3, bgcolor: 'transparent', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography variant="body2" color="text.secondary">Unavailable modules</Typography></AccordionSummary>
            <AccordionDetails>{unavailableAdminModules.map(item => <Typography key={item.title} variant="body2" color="text.secondary" sx={{ mb: 1 }}><strong>{item.title}:</strong> {item.reason}</Typography>)}</AccordionDetails>
          </Accordion>
        </>}

        {view === 'data' && <Paper elevation={0} sx={panel}>
          <Typography component="h2" variant="h5">Category data collections</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>Browse imported and contributed records by category. Zero is an empty collection; a dash means the count is unavailable.</Typography>
          <TextField fullWidth size="small" label="Search collections" value={collectionSearch} onChange={event => setCollectionSearch(event.target.value)} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>{['All', 'With records', 'Needs review', 'Empty'].map(status => <Chip key={status} label={status} onClick={() => setCollectionStatus(status)} aria-pressed={collectionStatus === status} color={collectionStatus === status ? 'primary' : 'default'} variant={collectionStatus === status ? 'filled' : 'outlined'} />)}</Box>
          {loading && !summary ? <CircularProgress size={24} aria-label="Loading collections" /> : collections.map(collection => <Box key={collection.slug} sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'minmax(0, 1fr) 110px 130px 130px' }, alignItems: 'center', gap: 2, py: 2.5, borderTop: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ gridColumn: { xs: '1 / -1', md: 'auto' } }}><Typography sx={{ fontWeight: 600 }}>{collection.name}</Typography><Typography variant="caption" color="text.secondary">{collection.slug}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Records</Typography><Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatCount(collection.records)}</Typography></Box>
            <Box><Typography variant="caption" color="text.secondary">Needs review</Typography><Typography sx={{ fontVariantNumeric: 'tabular-nums' }}>{formatCount(collection.pending)}</Typography></Box>
            {collection.manageable ? <Button component={RouterLink} to={`/bulk-data?category=${encodeURIComponent(collection.slug)}`} aria-label={`Open records for ${collection.name} (${collection.slug})`} endIcon={<ArrowForward />} sx={{ justifyContent: 'flex-start', px: 0 }}>Open records</Button> : <Typography variant="caption" color="text.secondary">Category link unavailable</Typography>}
          </Box>)}
          {!loading && !error && !collections.length && <Box sx={{ py: 3 }}><Typography>No collections match these filters.</Typography><Button onClick={() => { setCollectionSearch(''); setCollectionStatus('All'); }}>Clear filters</Button></Box>}
          <Typography variant="caption" color="text.secondary" aria-live="polite">{summary ? `Showing ${collections.length} of ${summary.collections.length} collections` : 'Collection data unavailable'}</Typography>
        </Paper>}

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>Updated {summary ? new Date(summary.updatedAt).toLocaleString() : '—'} · Summary views do not change records.</Typography>
      </>}
    </Box>
  </Box>;
};
export default AdminWorkspacePage;
