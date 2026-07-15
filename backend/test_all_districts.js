const query = `
  query GetPDistricts {
    pDistricts {
      id
      admin2NameEn
      gramaNiladharis {
        id
      }
    }
  }
`;

fetch('http://127.0.0.1:8000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
.then(res => res.json())
.then(data => {
  const ds = data.data.pDistricts;
  for (const d of ds) {
    console.log(`${d.id} - ${d.admin2NameEn}: ${d.gramaNiladharis.length} GNs`);
  }
})
.catch(err => console.error(err));
