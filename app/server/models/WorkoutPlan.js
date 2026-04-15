import mongoose from 'mongoose'

const exerciseSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  sets: { type: Number, required: true },
  reps: { type: Number, required: true },
  unit: { type: String, enum: ['次', '秒'], default: '次' },
  rest: { type: Number, default: 15 },
  duration: { type: Number, default: 0 }
})

const workoutPlanSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  duration: { type: Number, required: true },
  calories: { type: Number, required: true },
  difficulty: { type: String, required: true },
  goal: { type: String, enum: ['增肌', '减脂', '家庭训练'], default: '增肌' },
  exercises: [exerciseSchema]
}, { timestamps: true })

workoutPlanSchema.set('toJSON', { versionKey: false })

export default mongoose.model('WorkoutPlan', workoutPlanSchema)
