import mongoose from 'mongoose'

const workoutRecordSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true, index: true },
  planId: { type: String, required: true },
  planName: { type: String, required: true },
  duration: { type: Number, required: true },
  completed: { type: Boolean, default: true },
  exerciseCount: { type: Number, required: true },
  timestamp: { type: Number, default: () => Date.now() }
}, { timestamps: true })

workoutRecordSchema.index({ user: 1, date: -1 })

workoutRecordSchema.set('toJSON', { versionKey: false })

export default mongoose.model('WorkoutRecord', workoutRecordSchema)
