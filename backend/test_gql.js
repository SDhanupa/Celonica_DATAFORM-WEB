const query = `
  query GetPDistricts {
    pDistricts {
      id
      admin2NameEn
      admin2NameSi
      admin2NameTa
      admin2Pcode
      admin1Pcode
      populationBoth
      populationMale
      populationFemale
      pProvince {
        id
        admin1NameEn
        admin1NameSi
        admin1NameTa
        admin1Pcode
      }
    }
  }
`;

fetch('http://127.0.0.1:8000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({ query, operationName: 'GetPDistricts' })
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
