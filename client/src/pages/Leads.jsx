import { useEffect, useState, useCallback } from 'react'; import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, Pagination, Alert, Paper } from '@mui/material';
import api, { errMsg } from '../api';
export const STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];
export default function Leads() {
  const nav = useNavigate();
  const [q, setQ] = useState({ search: '', status: '', page: 1 }); const [data, setData] = useState({ items: [], pages: 1 }); const [err, setErr] = useState('');
  const load = useCallback(() => {
    api.get('/leads', { params: { ...q, limit: 10 } }).then((r) => setData(r.data)).catch((e) => setErr(errMsg(e)));
  }, [q]);
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t); }, [load]);
  const del = async (id) => {
    if (!confirm('Delete this lead?')) return;
    try { await api.delete(`/leads/${id}`); load(); } catch (e) { setErr(errMsg(e)); }
  };
  return (<>
    <Typography variant="h5" gutterBottom>Leads</Typography>{err && <Alert severity="error" onClose={() => setErr('')} sx={{ mb: 2 }}>{err}</Alert>}
    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
      <TextField size="small" label="Search" value={q.search} onChange={(e) => setQ({ ...q, search: e.target.value, page: 1 })} />
      <TextField size="small" select label="Status" sx={{ minWidth: 140 }} value={q.status} onChange={(e) => setQ({ ...q, status: e.target.value, page: 1 })}>
        <MenuItem value="">All</MenuItem>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
      <Button variant="contained" component={Link} to="/leads/new" sx={{ ml: 'auto' }}>+ Add Lead</Button>
    </Box>
    <Paper sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Name', 'Email', 'Status', 'Assigned To', 'Actions'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{data.items.map((l) => (<TableRow key={l._id}>
        <TableCell>{l.name}</TableCell><TableCell>{l.email}</TableCell><TableCell>{l.status}</TableCell><TableCell>{l.assignedTo?.name || '-'}</TableCell>
        <TableCell><Button size="small" onClick={() => nav(`/leads/${l._id}/edit`)}>Edit</Button><Button size="small" color="error" onClick={() => del(l._id)}>Delete</Button></TableCell></TableRow>))}
        {!data.items.length && <TableRow><TableCell colSpan={5} align="center">No leads found</TableCell></TableRow>}</TableBody></Table></Paper>
    <Pagination sx={{ mt: 2 }} count={data.pages || 1} page={q.page} onChange={(_, p) => setQ({ ...q, page: p })} />
  </>);
}
