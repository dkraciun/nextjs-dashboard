require("dotenv").config();

const { db } = require('@vercel/postgres');
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../src/app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seedUsers(client) {
  try {
    // Create the "users" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      );
    `;

    console.log(`Created "users" table`);

    // Insert data into the "users" table
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        try {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return client.sql`
            INSERT INTO users (id, name, email, password)
            VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
            ON CONFLICT (id) DO NOTHING;
          `;
        } catch (err) {
          console.error(`Error inserting user ${user.name}:`, err);
        }
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);

    return {
      createTable,
      users: insertedUsers,
    };
  } catch (error) {
    console.error('Error seeding users:', error.stack);
    throw error;
  }
}

async function seedInvoices(client) {
  try {
    // Create the "invoices" table if it doesn't exist
    const createTable = await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    customer_id UUID NOT NULL,
    amount INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    date DATE NOT NULL
  );
`;

    console.log(`Created "invoices" table`);

    // Insert data into the "invoices" table
    const insertedInvoices = await Promise.all(
      invoices.map((invoice) => {
        try {
          return client.sql`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
            ON CONFLICT (id) DO NOTHING;
          `;
        } catch (err) {
          console.error(`Error inserting invoice ${invoice.id}:`, err);
        }
      }),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);

    return {
      createTable,
      invoices: insertedInvoices,
    };
  } catch (error) {
    console.error('Error seeding invoices:', error.stack);
    throw error;
  }
}

async function seedCustomers(client) {
  try {
    // Create the "customers" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      );
    `;

    console.log(`Created "customers" table`);

    // Insert data into the "customers" table
    const insertedCustomers = await Promise.all(
      customers.map((customer) => {
        try {
          return client.sql`
            INSERT INTO customers (id, name, email, image_url)
            VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
            ON CONFLICT (id) DO NOTHING;
          `;
        } catch (err) {
          console.error(`Error inserting customer ${customer.name}:`, err);
        }
      }),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);

    return {
      createTable,
      customers: insertedCustomers,
    };
  } catch (error) {
    console.error('Error seeding customers:', error.stack);
    throw error;
  }
}

async function seedRevenue(client) {
  try {
    // Create the "revenue" table if it doesn't exist
    const createTable = await client.sql`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `;

    console.log(`Created "revenue" table`);

    // Insert data into the "revenue" table
    const insertedRevenue = await Promise.all(
      revenue.map((rev) => {
        try {
          return client.sql`
            INSERT INTO revenue (month, revenue)
            VALUES (${rev.month}, ${rev.revenue})
            ON CONFLICT (month) DO NOTHING;
          `;
        } catch (err) {
          console.error(`Error inserting revenue for month ${rev.month}:`, err);
        }
      }),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue`);

    return {
      createTable,
      revenue: insertedRevenue,
    };
  } catch (error) {
    console.error('Error seeding revenue:', error.stack);
    throw error;
  }
}

async function main() {
  const client = await db.connect();

  // Create UUID extension if not already created
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await seedUsers(client);
  await seedCustomers(client);
  await seedInvoices(client);
  await seedRevenue(client);

  // No need for client.end() in pool-based systems
}

main().catch((err) => {
  console.error('An error occurred while attempting to seed the database:', err);
});
