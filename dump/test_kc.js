const http = require('http');

async function getAdminToken() {
  const url = 'http://localhost:8080/realms/celonica-admin/protocol/openid-connect/token';
  const params = new URLSearchParams();
  params.append('client_id', 'celonica-frontend');
  params.append('username', 'superadmin');
  params.append('password', 'Admin@1234');
  params.append('grant_type', 'password');

  try {
    const res = await fetch(url, {
      method: 'POST',
      body: params
    });
    const data = await res.json();
    console.log(data);
  } catch (e) {
    console.error(e);
  }
}

getAdminToken();
