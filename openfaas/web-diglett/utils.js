const fs = require('fs')
/**
 * Authenticate request
 * @param {object} event
 * @returns {boolean} isAuthenticated
 */
const isAuthenticated = (event) => {
  const { headers: { authorization: Authorization } } = event
  console.log("Authorization Header", Authorization, event.headers)
  if (Authorization) {
    const expectedUsername = fs.readFileSync(`/var/openfaas/secrets/service-username`, 'utf8') 
    const expectedPassword = fs.readFileSync(`/var/openfaas/secrets/service-password`, 'utf8') 
    const basicAuthString =  new Buffer(Authorization.split(" ")[1], 'base64').toString()
    const [receivedUsername, receivedPassword] = basicAuthString.split(":")
    console.log("Credentials", expectedUsername, expectedPassword, receivedUsername, receivedPassword)
    return expectedUsername === receivedUsername && expectedPassword === receivedPassword
  }
  console.log("Authorization header not found")
  return false
}

module.exports = {
  isAuthenticated
}
