// Simple script to create test customers via the API
const fetch = require('node-fetch');

const API_BASE = 'http://localhost:3000';

async function createTestCustomers() {
  try {
    // You'll need to get an admin token first
    console.log('⚠️  To test customer search, you need to:');
    console.log('1. Login to the admin panel');
    console.log('2. Use the customer creation form to add test customers');
    console.log('3. Or directly add customers to the database');

    console.log('\nTest customer data you can use:');

    const testCustomers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        type: 'INDIVIDUAL',
        status: 'ACTIVE'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '+1987654321',
        type: 'BUSINESS',
        status: 'ACTIVE',
        companyName: 'Tech Solutions Inc'
      },
      {
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1555123456',
        type: 'INDIVIDUAL',
        status: 'ACTIVE'
      }
    ];

    console.log(JSON.stringify(testCustomers, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

createTestCustomers();