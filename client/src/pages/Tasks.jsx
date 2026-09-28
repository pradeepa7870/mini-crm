import { useEffect, useState } from 'react';
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, Box, Select } from '@mui/material';
import api, { errMsg } from '../api'; import { useAuth } from '../auth.jsx';
const empty = { title: '', lead: '', assignedTo: '', dueDate: '' };
export default function Tasks() {
  const { user } = useAuth();
  const [rows, setRows] = useState([]); const [leads, setLeads] = useState([]); const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false); const [f, setF] = useState(empty); const [err, setErr] = useState('');
  const load = () => api.get('/tasks').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); api.get('/leads', { params: { limit: 100 } }).then((r) => setLeads(r.data.items)); api.get('/users').then((r) => setUsers(r.data)); }, []);
  const create = async () => {
    if (!f.title || !f.lead || !f.assignedTo || !f.dueDate) return setErr('All fields are required');
    try { await api.post('/tasks', f); setOpen(false); setF(empty); setErr(''); load(); } catch (e) { setErr(errMsg(e)); }
  };
  const setStatus = async (id, status) => { try { await api.patch(`/tasks/${id}/status`, { status }); setErr(''); load(); } catch (e) { setErr(errMsg(e)); } };
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (<>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="h5">Tasks</Typography><Button variant="contained" onClick={() => setOpen(true)}>+ Add Task</Button></Box>
    {err && !open && <Alert severity="error" onClose={() => setErr('')} sx={{ mb: 2 }}>{err}</Alert>}
    <Paper sx={{ overflowX: 'auto' }}><Table size="small"><TableHead><TableRow>{['Title', 'Lead', 'Assigned To', 'Due Date', 'Status', 'Actions'].map((h) => <TableCell key={h}>{h}</TableCell>)}</TableRow></TableHead>
      <TableBody>{rows.map((t) => { const mine = t.assignedTo?._id === user.id; return (
        <TableRow key={t._id}><TableCell>{t.title}</TableCell><TableCell>{t.lead?.name || '(deleted lead)'}</TableCell><TableCell>{t.assignedTo?.name}</TableCell>
          <TableCell>{new Date(t.dueDate).toLocaleDateString()}</TableCell><TableCell>{t.status}</TableCell>
          <TableCell>{mine ? <Select size="small" value={t.status} onChange={(e) => setStatus(t._id, e.target.value)}>{['Pending', 'In Progress', 'Done'].map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</Select> : <Typography variant="caption" color="text.secondary">Assignee only</Typography>}</TableCell></TableRow>); })}
        {!rows.length && <TableRow><TableCell colSpan={6} align="center">No tasks yet</TableCell></TableRow>}</TableBody></Table></Paper>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Add Task</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>{err && <Alert severity="error">{err}</Alert>}
        <TextField label="Title" value={f.title} onChange={set('title')} />
        <TextField select label="Lead" value={f.lead} onChange={set('lead')}>{leads.map((l) => <MenuItem key={l._id} value={l._id}>{l.name}</MenuItem>)}</TextField>
        <TextField select label="Assign to" value={f.assignedTo} onChange={set('assignedTo')}>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField>
        <TextField label="Due date" type="date" InputLabelProps={{ shrink: true }} value={f.dueDate} onChange={set('dueDate')} /></DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={create}>Save</Button></DialogActions></Dialog>
  </>);
}
