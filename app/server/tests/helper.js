import mongoose from 'mongoose'

const TEST_DB_URI = 'mongodb://localhost:27017/fitpro_test'

export async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(TEST_DB_URI)
  }
}

export async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
}

export async function clearDB() {
  const collections = mongoose.connection.collections
  for (const key in collections) {
    await collections[key].deleteMany({})
  }
}
