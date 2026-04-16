// No global setup needed - tests use local MongoDB via helper.js
// Just set test environment variables
process.env.JWT_SECRET = 'test-secret-key'
process.env.PORT = '3001'

export default async function setup() {
  // Nothing to do - each test file manages its own connection
}
