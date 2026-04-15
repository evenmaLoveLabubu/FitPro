import mongoose from 'mongoose'
import WorkoutPlan from '../models/WorkoutPlan.js'
import WeekPlan from '../models/WeekPlan.js'
import Exercise from '../models/Exercise.js'
import { workoutPlansSeed, weekPlanSeed } from './seedData.js'
import { exerciseLibrarySeed } from './exerciseSeed.js'
import { config } from '../config/index.js'

async function seed() {
  await mongoose.connect(config.mongoUri)
  console.log('MongoDB connected')

  // Seed workout plans
  await WorkoutPlan.deleteMany({})
  for (const plan of workoutPlansSeed) {
    await WorkoutPlan.findOneAndUpdate({ id: plan.id }, plan, { upsert: true, new: true })
  }
  console.log(`Seeded ${workoutPlansSeed.length} workout plans`)

  // Seed week plans for each goal category
  await WeekPlan.deleteMany({})
  let totalWeekPlans = 0
  for (const [goal, plans] of Object.entries(weekPlanSeed)) {
    for (const plan of plans) {
      await WeekPlan.create({ ...plan, goal })
      totalWeekPlans++
    }
  }
  console.log(`Seeded ${totalWeekPlans} week plan entries`)

  // Seed exercise library
  await Exercise.deleteMany({})
  await Exercise.insertMany(exerciseLibrarySeed)
  console.log(`Seeded ${exerciseLibrarySeed.length} exercises`)

  console.log('Seed complete!')
  process.exit(0)
}

seed().catch(err => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
