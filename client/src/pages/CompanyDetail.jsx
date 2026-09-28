import { useEffect, useState } from 'react'; import { useParams, Link } from 'react-router-dom';
import { Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Alert } from '@mui/material';
import api, { errMsg } from '../api';
export default function CompanyDetail() {
  const { id } = useParams(); const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get(`/companies/${id}`).then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, [id]);
  if (err) return <Alert severity="error">{err}</Alert>; if (!d) return null;
  return (<>
    <Link to="/companies">← Companies</Link>
    <Paper sx={{ p: 2, my: 2 }}><Typography variant="h5">{d.company.name}</Typography><Typography>Industry: {d.company.industry || '-'}</Typography><Typography>Location: {d.company.location || '-'}</Typography></Paper>
    <Typography variant="h6" gutterBottom>Associated Leads</Typography>
    <Paper><Table size="small"><TableHead><TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Status</TableCell><TableCell>Assigned To</TableCell></TableRow></TableHead>
      <TableBody>{d.leads.map((l) => <TableRow key={l._id}><TableCell>{l.name}</TableCell><TableCell>{l.email}</TableCell><TableCell>{l.status}</TableCell><TableCell>{l.assignedTo?.name || '-'}</TableCell></TableRow>)}
        {!d.leads.length && <TableRow><TableCell colSpan={4} align="center">No leads for this company</TableCell></TableRow>}</TableBody></Table></Paper>
  </>);
}
