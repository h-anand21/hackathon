fetch('https://hanand.hashnode.dev/api/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query Publication {
        publication(host: "hanand.hashnode.dev") {
          posts(first: 3) {
            edges {
              node {
                title
              }
            }
          }
        }
      }
    `
  })
})
.then(res => res.text())
.then(data => console.log(data))
.catch(err => console.error(err));
