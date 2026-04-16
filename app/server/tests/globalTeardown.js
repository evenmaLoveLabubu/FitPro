import mongoose from 'mongoose'

export default async function teardown() {
  // Clean up test database after all tests
  try {
    await mongoose.connect('mongodb://localhost:27017/fitpro_test')
    await mongoose.connection.db.dropDatabase()
    await mongoose.disconnect()
  } catch {
    // Ignore if already disconnected
  }
}
