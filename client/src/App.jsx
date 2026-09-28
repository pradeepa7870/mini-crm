import { Routes, Route, Navigate, NavLink, Outlet } from 'react-router-dom';
import { Box, Drawer, List, ListItemButton, ListItemText, AppBar, Toolbar, Typography, Button } from '@mui/material';
import { useAuth } from './auth.jsx';
import Login from './pages/Login.jsx'; import Dashboard from './pages/Dashboard.jsx';
import Leads from './pages/Leads.jsx'; import LeadForm from './pages/LeadForm.jsx';
import Companies from './pages/Companies.jsx'; import CompanyDetail from './pages/CompanyDetail.jsx'; import Tasks from './pages/Tasks.jsx';

const nav = [['Dashboard', '/'], ['Leads', '/leads'], ['Companies', '/companies'], ['Tasks', '/tasks']];
function Layout() {
  const { user, logout } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" sx={{ width: 200, '& .MuiDrawer-paper': { width: 200 } }}>
        <Typography variant="h6" sx={{ p: 2 }}>MINI CRM</Typography>
        <List>{nav.map(([l, to]) => (
          <NavLink key={to} to={to} end={to === '/'} style={{ textDecoration: 'none', color: 'inherit' }}>
            {({ isActive }) => <ListItemButton selected={isActive}><ListItemText primary={l} /></ListItemButton>}
          </NavLink>))}</List>
      </Drawer>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="static" color="default" elevation={1}><Toolbar sx={{ justifyContent: 'flex-end', gap: 2 }}>
          <Typography>{user.name}</Typography><Button onClick={logout}>Logout</Button></Toolbar></AppBar>
        <Box sx={{ p: 3 }}><Outlet /></Box>
      </Box>
    </Box>);
}
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
        <Route path="leads/new" element={<LeadForm />} />
        <Route path="leads/:id/edit" element={<LeadForm />} />
        <Route path="companies" element={<Companies />} />
        <Route path="companies/:id" element={<CompanyDetail />} />
        <Route path="tasks" element={<Tasks />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>);
}
