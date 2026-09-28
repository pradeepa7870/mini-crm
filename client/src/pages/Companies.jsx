import { useEffect, useState } from 'react'; import { Link } from 'react-router-dom';
import { Typography, Button, Table, TableHead, TableRow, TableCell, TableBody, Paper, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert, Box } from '@mui/material';
import api, { errMsg } from '../api';
export default function Companies() {
  const [rows, setRows] = useState([]); const [open, setOpen] = useState(false); const [f, setF] = useState({ name: '', industry: '', location: '' }); const [err, setErr] = useState('');
  const load = () => api.get('/companies').then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e)));
  useEffect(() => { load(); }, []);
  const save = async () => {
    if (!f.name) return setErr('Company name is required');
    try { await api.post('/companies', f); setOpen(false); setF({ name: '', industry: '', location: '' }); setErr(''); load(); } catch (e) { setErr(errMsg(e)); }
  };
  return (<>
    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}><Typography variant="h5">Companies</Typography><Button variant="contained" onClick={() => setOpen(true)}>+ Add Company</Button></Box>
    {err && !open && <Alert severity="error" sx={{ mb: 2 }}>{err}</Alert>}
    <Paper><Table size="small"><TableHead><TableRow><TableCell>Company Name</TableCell><TableCell>Industry</TableCell><TableCell>Location</TableCell></TableRow></TableHead>
      <TableBody>{rows.map((c) => <TableRow key={c._id} hover><TableCell><Link to={`/companies/${c._id}`}>{c.name}</Link></TableCell><TableCell>{c.industry}</TableCell><TableCell>{c.location}</TableCell></TableRow>)}</TableBody></Table></Paper>
    <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="xs"><DialogTitle>Add Company</DialogTitle>
      <DialogContent sx={{ display: 'grid', gap: 2, pt: '8px !important' }}>{err && <Alert severity="error">{err}</Alert>}
        {['name', 'industry', 'location'].map((k) => <TextField key={k} label={k[0].toUpperCase() + k.slice(1)} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} />)}</DialogContent>
      <DialogActions><Button onClick={() => setOpen(false)}>Cancel</Button><Button variant="contained" onClick={save}>Save</Button></DialogActions></Dialog>
  </>);
}
