const query = `
  query {
    gnByCoordinates(lat: 8.1986, lng: 80.2826) {
      id
      code
      nameEn
      nameSi
      nameTa
      pDistrict {
        id
        admin2NameEn
        admin2NameSi
        admin2NameTa
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
  if (data.errors) {
    console.error("ERROR MESSAGE:", data.errors[0].message);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
})
.catch(err => console.error(err));
