import mongoose from 'mongoose'

const weekPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, index: true },
  dayOrder: { type: Number, required: true, enum: [0, 1, 2, 3, 4, 5, 6] },
  day: { type: String, required: true },
  name: { type: String, required: true },
  duration: { type: String, default: '' },
  tags: [{ type: String }],
  planId: { type: String, default: null },
  goal: { type: String, enum: ['增肌', '减脂', '家庭训练'], default: '减脂' },
  isRest: { type: Boolean, default: false }
}, { timestamps: true })

weekPlanSchema.index({ user: 1, goal: 1, dayOrder: 1 })
weekPlanSchema.set('toJSON', { versionKey: false })

export default mongoose.model('WeekPlan', weekPlanSchema)
