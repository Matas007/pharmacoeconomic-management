import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Migrating old MULTIPLE_CHOICE questions to SINGLE_CHOICE...')

  // Gauti visus MULTIPLE_CHOICE klausimus
  const questions = await prisma.surveyQuestion.findMany({
    where: {
      type: 'MULTIPLE_CHOICE'
    },
    include: {
      answers: true
    }
  })

  let converted = 0

  for (const question of questions) {
    // Patikrinti ar bent vienas atsakymas turi kablelį (multiple selections)
    const hasMultipleSelections = question.answers.some(answer => 
      answer.answer.includes(',')
    )

    // Jei nėra multiple selections, pakeisti į SINGLE_CHOICE
    if (!hasMultipleSelections && question.answers.length > 0) {
      await prisma.surveyQuestion.update({
        where: { id: question.id },
        data: { type: 'SINGLE_CHOICE' }
      })
      console.log(`✅ Converted question "${question.question.substring(0, 50)}..." to SINGLE_CHOICE`)
      converted++
    } else if (question.answers.length === 0) {
      // Jei nėra atsakymų, taip pat pakeisti į SINGLE_CHOICE (safe default)
      await prisma.surveyQuestion.update({
        where: { id: question.id },
        data: { type: 'SINGLE_CHOICE' }
      })
      console.log(`✅ Converted unanswered question "${question.question.substring(0, 50)}..." to SINGLE_CHOICE`)
      converted++
    }
  }

  console.log(`\n✨ Migration complete! Converted ${converted} questions.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())


