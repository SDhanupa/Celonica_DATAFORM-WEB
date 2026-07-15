const query = `
  query GetPDistrictWithGns($id: ID!) {
    pDistrict(id: $id) {
      id
      gramaNiladharis {
        id
        code
        nameEn
        nameSi
        nameTa
        divisionalSecretariatCode
        pGn {
          id
          gnName
          populationBoth
          populationMale
          populationFemale
        }
      }
    }
  }
`;

async function testAll() {
  for (let i = 1; i <= 25; i++) {
    const res = await fetch('http://127.0.0.1:8000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, variables: { id: i.toString() } }),
    });
    const data = await res.json();
    if (data.errors) {
      console.log(`Error for district ${i}:`, JSON.stringify(data.errors, null, 2));
    } else {
      console.log(`District ${i} OK, GNs: ${data.data.pDistrict.gramaNiladharis.length}`);
    }
  }
}
testAll();
