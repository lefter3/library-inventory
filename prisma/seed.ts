import { PrismaClient } from '@prisma/client';
import books from './seeds/books.json';
import users from './seeds/users.json';

const prisma = new PrismaClient();


async function seedUsers() {
    for (const user of users) {
        await prisma.users.create({
          data: {
            email: user.email,
            role: user.role,
          },
        });
        console.log(`User ${user.email} created.`);
      }
}

async function seedBooks() {
    try {
        for (const book of books) {
            await prisma.books.create({
                data: {
                    title: book.title,
                    genres: book.genres,
                    authors: book.authors,
                    stockSize: book.copies,
                    stockPrice: book.prices.stock,
                    sellPrice: book.prices.sell,
                    borrowPrice: book.prices.borrow,
                    copies: book.copies,
                },
            })
            // .catch((error: Error) => {
            //     console.error('Error creating book:', error);
            // }).finally(() => {
            //     
            // });
        }
        console.log(`Books created.`);

    } catch (error) {
        console.error('Error creating book:', error);
    }
}

async function seedAmount() {
    await prisma.wallet.create({
        data: {
            amount: 1000
        }
    })
}

async function main() {
    await Promise.all([
        seedUsers(),
        seedBooks(),
        seedAmount()
    ])

  console.log('Seeding complete');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
