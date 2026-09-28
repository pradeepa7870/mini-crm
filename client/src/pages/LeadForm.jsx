import { useEffect, useState } from 'react'; import { useNavigate, useParams } from 'react-router-dom';
import { Paper, Typography, TextField, MenuItem, Button, Box, Alert } from '@mui/material';
import api, { errMsg } from '../api'; import { STATUSES } from './Leads.jsx';
export default function LeadForm() {
  const { id } = useParams(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', phone: '', status: 'New', assignedTo: '', company: '' });
  const [users, setUsers] = useState([]); const [companies, setCompanies] = useState([]); const [err, setErr] = useState(''); const [touched, setTouched] = useState(false);
  useEffect(() => {
    api.get('/users').then((r) => setUsers(r.data)); api.get('/companies').then((r) => setCompanies(r.data));
    if (id) api.get(`/leads/${id}`).then((r) => setF({ name: r.data.name, email: r.data.email, phone: r.data.phone || '', status: r.data.status, assignedTo: r.data.assignedTo || '', company: r.data.company || '' })).catch((e) => setErr(errMsg(e)));
  }, [id]);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const save = async (e) => {
    e.preventDefault(); setTouched(true); if (!f.name || !f.email) return;
    try { id ? await api.put(`/leads/${id}`, f) : await api.post('/leads', f); nav('/leads'); } catch (x) { setErr(errMsg(x)); }
  };
  return (<Paper component="form" onSubmit={save} sx={{ p: 3, maxWidth: 500, display: 'grid', gap: 2 }}>
    <Typography variant="h5">{id ? 'Edit' : 'Add'} Lead</Typography>{err && <Alert severity="error">{err}</Alert>}
    <TextField label="Name" value={f.name} onChange={set('name')} error={touched && !f.name} helperText={touched && !f.name && 'Required'} />
    <TextField label="Email" type="email" value={f.email} onChange={set('email')} error={touched && !f.email} helperText={touched && !f.email && 'Required'} />
    <TextField label="Phone" value={f.phone} onChange={set('phone')} />
    <TextField select label="Status" value={f.status} onChange={set('status')}>{STATUSES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}</TextField>
    <TextField select label="Assigned To" value={f.assignedTo} onChange={set('assignedTo')}><MenuItem value="">Unassigned</MenuItem>{users.map((u) => <MenuItem key={u._id} value={u._id}>{u.name}</MenuItem>)}</TextField>
    <TextField select label="Company" value={f.company} onChange={set('company')}><MenuItem value="">None</MenuItem>{companies.map((c) => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}</TextField>
    <Box sx={{ display: 'flex', gap: 1 }}><Button type="submit" variant="contained">Save</Button><Button onClick={() => nav('/leads')}>Cancel</Button></Box>
  </Paper>);
}
