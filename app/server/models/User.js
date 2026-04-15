import mongoose from 'mongoose'

const achievementSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  icon: { type: String, required: true },
  unlocked: { type: Boolean, default: false }
})

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  nickname: { type: String, default: '健身达人' },
  avatar: { type: String, default: '' },
  phone: { type: String, default: '' },
  birthday: { type: String, default: '' },
  streak: { type: Number, default: 0 },
  goal: { type: String, enum: ['增肌', '减脂'], default: '减脂' },
  totalWorkouts: { type: Number, default: 0 },
  totalMinutes: { type: Number, default: 0 },
  achievements: [achievementSchema]
}, { timestamps: true })

// Never return password in JSON
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password
    delete ret.__v
    return ret
  }
})

export default mongoose.model('User', userSchema)
