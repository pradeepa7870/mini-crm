import { useState } from 'react'; import { useNavigate, Navigate } from 'react-router-dom';
import { Box, Paper, Typography, TextField, Button, Alert } from '@mui/material';
import { useAuth } from '../auth.jsx'; import { errMsg } from '../api';
export default function Login() {
  const { user, login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ email: '', password: '' }); const [err, setErr] = useState(''); const [touched, setTouched] = useState(false);
  if (user) return <Navigate to="/" replace />;
  const submit = async (e) => {
    e.preventDefault(); setTouched(true); setErr('');
    if (!f.email || !f.password) return;
    try { await login(f.email, f.password); nav('/'); } catch (x) { setErr(errMsg(x)); }
  };
  return (
    <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <Paper component="form" onSubmit={submit} sx={{ p: 4, width: 360, display: 'grid', gap: 2 }}>
        <Typography variant="h5" align="center">MINI CRM</Typography>
        {err && <Alert severity="error">{err}</Alert>}
        <TextField label="Email" type="email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} error={touched && !f.email} helperText={touched && !f.email && 'Email is required'} />
        <TextField label="Password" type="password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} error={touched && !f.password} helperText={touched && !f.password && 'Password is required'} />
        <Button type="submit" variant="contained">Login</Button>
      </Paper>
    </Box>);
}
