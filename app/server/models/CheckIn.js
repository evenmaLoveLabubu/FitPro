import mongoose from 'mongoose'

const checkInSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  checkedIn: { type: Boolean, default: false },
  planId: { type: String },
  planName: { type: String },
  duration: { type: Number },
  completed: { type: Boolean, default: false },
  exerciseCount: { type: Number }
}, { timestamps: true })

checkInSchema.set('toJSON', { versionKey: false })

export default mongoose.model('CheckIn', checkInSchema)
