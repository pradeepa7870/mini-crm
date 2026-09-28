import { useEffect, useState } from 'react'; import { Grid, Paper, Typography, Alert } from '@mui/material';
import api, { errMsg } from '../api';
export default function Dashboard() {
  const [d, setD] = useState(null); const [err, setErr] = useState('');
  useEffect(() => { api.get('/dashboard').then((r) => setD(r.data)).catch((e) => setErr(errMsg(e))); }, []);
  const cards = d && [['Total Leads', d.totalLeads], ['Qualified Leads', d.qualifiedLeads], ['Tasks Due Today', d.tasksDueToday], ['Completed Tasks', d.completedTasks]];
  return (<><Typography variant="h5" gutterBottom>Dashboard</Typography>{err && <Alert severity="error">{err}</Alert>}
    <Grid container spacing={2}>{cards?.map(([l, v]) => (
      <Grid item xs={12} sm={6} key={l}><Paper sx={{ p: 3 }}><Typography color="text.secondary">{l}</Typography><Typography variant="h3">{v}</Typography></Paper></Grid>))}</Grid></>);
}
