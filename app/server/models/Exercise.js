import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  category: { type: String, required: true, index: true },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  sets: { type: Number, default: 3 },
  reps: { type: Number, default: 12 },
  unit: { type: String, enum: ['次', '秒'], default: '次' },
  rest: { type: Number, default: 15 },
  duration: { type: Number, default: 0 }
}, { timestamps: true })

exerciseSchema.index({ createdBy: 1, category: 1 })
exerciseSchema.set('toJSON', { versionKey: false })

export default mongoose.model('Exercise', exerciseSchema)
