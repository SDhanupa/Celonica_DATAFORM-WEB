const query = `
  {
    __type(name: "GramaNiladhari") {
      name
      fields {
        name
        type {
          name
          kind
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
  body: JSON.stringify({ query }),
})
.then(res => res.json())
.then(data => console.log(JSON.stringify(data, null, 2)))
.catch(err => console.error(err));
