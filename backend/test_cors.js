const query = `
  query GetPDistricts {
    pDistricts {
      id
      admin2NameEn
    }
  }
`;

fetch('http://127.0.0.1:8000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'http://localhost:5173'
  },
  body: JSON.stringify({ query, operationName: 'GetPDistricts' })
})
.then(res => {
  console.log('Status:', res.status);
  console.log('Headers:', res.headers);
  return res.text();
})
.then(text => console.log('Body:', text.substring(0, 500)))
.catch(err => console.error(err));
