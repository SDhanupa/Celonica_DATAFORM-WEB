# GN Admin Implementation Details

This document contains all the necessary instructions and code to restore the `gn_admin` feature later.

## 1. Keycloak Setup Script

Run this script on the backend (`php create-gn-admin.php`) to automatically create the `gn_admin` role and assign it to the `gnadmin` user.

**`backend/create-gn-admin.php`**:
```php
<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;

$keycloakUrl = 'http://localhost:8080';
$realm = 'ceylonica-admin';

// Get Admin Token
$response = Http::asForm()->post("$keycloakUrl/realms/$realm/protocol/openid-connect/token", [
    'client_id' => 'admin-cli',
    'client_secret' => 'my-super-secret-keycloak-client-secret',
    'grant_type' => 'client_credentials'
]);

if (!$response->successful()) {
    echo "Failed to get token: " . $response->body() . "\n";
    exit(1);
}

$token = $response->json('access_token');
echo "Got admin token\n";

// Create User
$username = 'gnadmin';
$password = 'GnAdmin@2026!';

$createUserResponse = Http::withToken($token)
    ->withHeaders(['Content-Type' => 'application/json'])
    ->post("$keycloakUrl/admin/realms/$realm/users", [
        'username' => $username,
        'enabled' => true,
        'emailVerified' => true,
        'firstName' => 'GN',
        'lastName' => 'Admin',
        'credentials' => [
            [
                'type' => 'password',
                'value' => $password,
                'temporary' => false
            ]
        ]
    ]);

if ($createUserResponse->successful() || $createUserResponse->status() === 201) {
    echo "User created successfully.\n";
} elseif ($createUserResponse->status() === 409) {
    echo "User already exists.\n";
} else {
    echo "Failed to create user: " . $createUserResponse->body() . "\n";
    exit(1);
}

// Get User ID
$usersResponse = Http::withToken($token)->get("$keycloakUrl/admin/realms/$realm/users?username=$username");
$users = $usersResponse->json();
$userId = $users[0]['id'];

// Fetch all roles to find gn_admin
$rolesResponse = Http::withToken($token)->get("$keycloakUrl/admin/realms/$realm/roles");
$roles = $rolesResponse->json();

$role = null;
if (is_array($roles)) {
    foreach ($roles as $r) {
        if (isset($r['name']) && $r['name'] === 'gn_admin') {
            $role = $r;
            break;
        }
    }
}

if (!$role) {
    echo "Creating gn_admin role...\n";
    Http::withToken($token)->post("$keycloakUrl/admin/realms/$realm/roles", [
        'name' => 'gn_admin'
    ]);
    
    $rolesResponse = Http::withToken($token)->get("$keycloakUrl/admin/realms/$realm/roles");
    $roles = $rolesResponse->json();
    if (is_array($roles)) {
        foreach ($roles as $r) {
            if (isset($r['name']) && $r['name'] === 'gn_admin') {
                $role = $r;
                break;
            }
        }
    }
}

if (!$role) {
    echo "Could not find or create gn_admin role!\n";
    exit(1);
}

// Assign Role
$assignRoleResponse = Http::withToken($token)
    ->withHeaders(['Content-Type' => 'application/json'])
    ->post("$keycloakUrl/admin/realms/$realm/users/$userId/role-mappings/realm", [
        [
            'id' => $role['id'],
            'name' => $role['name']
        ]
    ]);

if ($assignRoleResponse->successful() || $assignRoleResponse->status() === 204) {
    echo "Role gn_admin assigned successfully.\n";
} else {
    echo "Failed to assign role: " . $assignRoleResponse->body() . "\n";
}

echo "\nCredentials:\nUsername: $username\nPassword: $password\n";
```

## 2. GN Admin Dashboard Component

Place this file at **`frontend/src/pages/GnAdminDashboard.tsx`**:
```tsx
import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions, Chip, Divider,
  IconButton, Tooltip, CircularProgress, Container
} from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { useAuth } from '../auth/AuthProvider';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import IndustrySurveyPage from './IndustrySurveyPage';

interface Survey {
  id: number;
  ccode: string;
  district: string;
  ds_division: string;
  gn_name: string;
  form_data: any;
  status: string;
  created_at: string;
}

const StatusChip: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, { label: string; color: 'success' | 'primary' | 'default' | 'warning'; icon: string }> = {
    approved: { label: 'Approved', color: 'success', icon: '✅' },
    submitted: { label: 'Submitted', color: 'primary', icon: '📤' },
    draft: { label: 'Draft', color: 'default', icon: '📝' },
  };
  const s = map[status] ?? { label: status, color: 'default', icon: '❓' };
  return (
    <Chip
      label={`${s.icon} ${s.label}`}
      color={s.color}
      size="small"
      sx={{ fontWeight: 700, fontSize: '0.72rem' }}
    />
  );
};

const GnAdminDashboard: React.FC = () => {
  const { token, userInfo } = useAuth();
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editSurvey, setEditSurvey] = useState<Survey | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [viewSurvey, setViewSurvey] = useState<Survey | null>(null);

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/industry-surveys`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch surveys', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchSurveys();
  }, [token]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this survey?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/industry-surveys/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchSurveys();
      } else {
        alert('Failed to delete survey');
      }
    } catch (err) {
      console.error('Error deleting', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEdit = (survey: Survey) => {
    setEditSurvey(survey);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditSurvey(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditSurvey(null);
    fetchSurveys();
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 70 },
    { 
      field: 'business_name', 
      headerName: 'Business Name', 
      flex: 1,
      valueGetter: (value: any, row: any) => row?.form_data?.b_name || 'N/A'
    },
    { field: 'gn_name', headerName: 'GN Name', width: 150 },
    { field: 'ccode', headerName: 'GN Code', width: 120 },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params: GridRenderCellParams) => <StatusChip status={params.row.status} />
    },
    {
      field: 'created_at',
      headerName: 'Date',
      width: 150,
      valueGetter: (value: any, row: any) => row?.created_at ? new Date(row.created_at).toLocaleDateString() : 'N/A'
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 160,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const row = params.row as Survey;
        const isDeleting = deletingId === row.id;
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="View Survey">
              <IconButton 
                size="small" 
                color="info" 
                onClick={() => setViewSurvey(row)}
              >
                <VisibilityIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Edit Survey">
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => handleEdit(row)}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete Survey">
              <IconButton 
                size="small" 
                color="error" 
                disabled={isDeleting}
                onClick={() => handleDelete(row.id)}
              >
                {isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          </Box>
        );
      }
    }
  ];

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={700} color="primary">
          GN Admin Dashboard
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreate}
          sx={{ borderRadius: '20px', px: 3 }}
        >
          Create Industry Survey
        </Button>
      </Box>

      <Paper sx={{ width: '100%', height: 600, overflow: 'hidden', borderRadius: 2, boxShadow: 3 }}>
        <DataGrid
          rows={surveys}
          columns={columns}
          loading={loading}
          disableRowSelectionOnClick
          sx={{
            border: 0,
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f7fa',
              color: '#333',
              fontWeight: 'bold',
            },
          }}
        />
      </Paper>

      {/* Full Screen Form Dialog */}
      <Dialog 
        fullScreen 
        open={formOpen} 
        onClose={handleFormClose}
      >
        {formOpen && (
          <Box sx={{ position: 'relative', height: '100%', overflow: 'auto', bgcolor: 'background.default' }}>
            <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1100 }}>
              <Button variant="contained" color="error" onClick={handleFormClose} sx={{ borderRadius: '20px' }}>
                Close Form
              </Button>
            </Box>
            <IndustrySurveyPage 
              propsGnName={editSurvey?.gn_name}
              propsCcode={editSurvey?.ccode}
              propsEditId={editSurvey?.id}
              propsSurveyData={editSurvey}
              onClose={handleFormClose}
              onSuccess={handleFormClose}
            />
          </Box>
        )}
      </Dialog>
      {/* View Survey Dialog */}
      <Dialog 
        fullScreen
        open={!!viewSurvey} 
        onClose={() => setViewSurvey(null)}
      >
        <Box sx={{ position: 'relative', height: '100%', overflow: 'auto', bgcolor: 'background.default' }}>
          <Box sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1100 }}>
             <Button variant="contained" color="error" onClick={() => setViewSurvey(null)} sx={{ borderRadius: '20px', pointerEvents: 'auto' }}>
                Close View
             </Button>
          </Box>
          <Box>
             <IndustrySurveyPage 
                propsGnName={viewSurvey?.gn_name}
                propsCcode={viewSurvey?.ccode}
                propsEditId={viewSurvey?.id}
                propsSurveyData={viewSurvey}
                propsReadOnly={true}
                onClose={() => setViewSurvey(null)}
                onSuccess={() => setViewSurvey(null)}
             />
          </Box>
        </Box>
      </Dialog>
    </Container>
  );
};

export default GnAdminDashboard;
```

## 3. Git Patch for Changes
To apply the remaining changes, run `git apply gn_admin_diff.patch` when you are ready to restore this feature.
