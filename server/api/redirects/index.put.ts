export default eventHandler(async (event) => {
  const body = await readBody(event)
console.log(JSON.stringify(event));
console.log(JSON.stringify(body));

  // Used in server/routes/redirects.ts
  await hubKV().set('redirects', {a:'s'})

  return body
})
