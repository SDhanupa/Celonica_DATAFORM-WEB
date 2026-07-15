const query = `
  query GetPDistrictWithGns($id: ID!) {
    pDistrict(id: $id) {
      id
      admin2NameEn
      admin2NameSi
      admin2NameTa
      admin2Pcode
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

fetch('http://127.0.0.1:8000/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query, variables: { id: "1" } }),
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2).substring(0, 500)))
.catch(err => console.error(err));
