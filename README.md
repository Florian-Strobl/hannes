# Farmer's Meat Shop

A dynamic interactive website for a farmer to sell meat in kg. Features user authentication, inventory management, order system, and a smooth UI with animations.

## Features

- User registration and login (customers and farmers)
- Farmers can add/edit meat types with name and price
- Customers can browse meat, search, and order by kg
- Automatic stock updates on orders
- Admin panel for farmers to manage inventory and view orders
- Responsive design with animations

## Getting Started

First, install dependencies:

```bash
npm install
```

Set up the database:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- Next.js 16
- TypeScript
- Tailwind CSS
- Prisma with SQLite
- NextAuth.js
- Framer Motion for animations

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
