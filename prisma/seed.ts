import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create Products
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Essence (Gasoline)',
        description: 'Regular gasoline fuel'
      }
    }),
    prisma.product.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Mazout (Diesel)',
        description: 'Diesel fuel for heavy vehicles'
      }
    }),
    prisma.product.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Premium Gasoline',
        description: 'High-octane premium gasoline'
      }
    })
  ])

  console.log('✅ Products created:', products.length)

  // Create Blocks
  const blocks = await Promise.all([
    prisma.block.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Block A - Pump 1'
      }
    }),
    prisma.block.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Block A - Pump 2'
      }
    }),
    prisma.block.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Block B - Pump 1'
      }
    }),
    prisma.block.upsert({
      where: { id: 4 },
      update: {},
      create: {
        name: 'Block B - Pump 2'
      }
    })
  ])

  console.log('✅ Blocks created:', blocks.length)

  // Create Cashiers
  const cashiers = await Promise.all([
    prisma.cashier.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'John Smith',
        email: 'john.smith@gasstation.com',
        phone: '+1-555-0101'
      }
    }),
    prisma.cashier.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@gasstation.com',
        phone: '+1-555-0102'
      }
    }),
    prisma.cashier.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Mike Wilson',
        email: 'mike.wilson@gasstation.com',
        phone: '+1-555-0103'
      }
    })
  ])

  console.log('✅ Cashiers created:', cashiers.length)

  // Create Shifts
  const shifts = await Promise.all([
    prisma.shift.upsert({
      where: { id: 1 },
      update: {},
      create: {
        name: 'Morning Shift',
        startTime: new Date('2000-01-01T06:00:00'),
        endTime: new Date('2000-01-01T14:00:00')
      }
    }),
    prisma.shift.upsert({
      where: { id: 2 },
      update: {},
      create: {
        name: 'Evening Shift',
        startTime: new Date('2000-01-01T14:00:00'),
        endTime: new Date('2000-01-01T22:00:00')
      }
    }),
    prisma.shift.upsert({
      where: { id: 3 },
      update: {},
      create: {
        name: 'Night Shift',
        startTime: new Date('2000-01-01T22:00:00'),
        endTime: new Date('2000-01-02T06:00:00')
      }
    })
  ])

  console.log('✅ Shifts created:', shifts.length)

  // Create Block Shifts
  const today = new Date()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)

  const blockShifts = await Promise.all([
    prisma.blockShift.upsert({
      where: { id: 1 },
      update: {},
      create: {
        blockId: 1,
        shiftId: 1,
        cashierId: 1,
        date: today
      }
    }),
    prisma.blockShift.upsert({
      where: { id: 2 },
      update: {},
      create: {
        blockId: 2,
        shiftId: 1,
        cashierId: 2,
        date: today
      }
    }),
    prisma.blockShift.upsert({
      where: { id: 3 },
      update: {},
      create: {
        blockId: 3,
        shiftId: 2,
        cashierId: 3,
        date: today
      }
    }),
    prisma.blockShift.upsert({
      where: { id: 4 },
      update: {},
      create: {
        blockId: 1,
        shiftId: 1,
        cashierId: 1,
        date: yesterday
      }
    })
  ])

  console.log('✅ Block Shifts created:', blockShifts.length)

  // Create Stock entries
  const stockEntries = await Promise.all([
    prisma.stock.upsert({
      where: { id: 1 },
      update: {},
      create: {
        productId: 1,
        quantity: 5000.00
      }
    }),
    prisma.stock.upsert({
      where: { id: 2 },
      update: {},
      create: {
        productId: 2,
        quantity: 8000.00
      }
    }),
    prisma.stock.upsert({
      where: { id: 3 },
      update: {},
      create: {
        productId: 3,
        quantity: 3000.00
      }
    })
  ])

  console.log('✅ Stock entries created:', stockEntries.length)

  // Create sample stock records for the past week
  const stockRecords = []
  
  for (let i = 0; i < 7; i++) {
    const recordDate = new Date(today)
    recordDate.setDate(today.getDate() - i)
    
    for (const product of products) {
      const baseQuantity = product.id === 1 ? 5000 : product.id === 2 ? 8000 : 3000
      const variation = Math.random() * 200 - 100 // Random variation of ±100 litres
      const quantity = Math.max(0, baseQuantity + variation)
      
      stockRecords.push(
        prisma.stockRecord.upsert({
          where: {
            productId_recordDate: {
              productId: product.id,
              recordDate: recordDate
            }
          },
          update: {},
          create: {
            productId: product.id,
            quantity: quantity,
            recordDate: recordDate,
            notes: i === 0 ? 'Daily stock check' : `Stock record for ${recordDate.toLocaleDateString()}`
          }
        })
      )
    }
  }
  
  await Promise.all(stockRecords)
  console.log('✅ Stock records created:', stockRecords.length)

  // Create some sample sales
  const sales = await Promise.all([
    prisma.sale.upsert({
      where: { id: 1 },
      update: {},
      create: {
        blockShiftId: 1,
        productId: 1,
        litresSold: 50.25,
        revenue: 62.81,
        date: today
      }
    }),
    prisma.sale.upsert({
      where: { id: 2 },
      update: {},
      create: {
        blockShiftId: 2,
        productId: 2,
        litresSold: 45.55,
        revenue: 52.38,
        date: today
      }
    }),
    prisma.sale.upsert({
      where: { id: 3 },
      update: {},
      create: {
        blockShiftId: 3,
        productId: 1,
        litresSold: 80.25,
        revenue: 100.31,
        date: today
      }
    })
  ])

  console.log('✅ Sales created:', sales.length)

  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
