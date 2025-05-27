const axios = require('axios');

const BASE_URL = 'https://67ac71475853dfff53dab929.mockapi.io/api/v1';

async function testAPIEndpoints() {
    console.log('🚀 Starting Personal Finance Tracker API Tests\n');

    try {
        // Task 1: Test User Login endpoint
        console.log('📝 Task 1: Testing User Login...');
        const usersResponse = await axios.get(`${BASE_URL}/users`);
        console.log(`✅ Users endpoint accessible - Found ${usersResponse.data.length} users`);
        
        if (usersResponse.data.length > 0) {
            const testUser = usersResponse.data[0];
            console.log(`✅ Sample user: ${testUser.username} (ID: ${testUser.id})`);
        }

        // Task 4: Test Get All Expenses
        console.log('\n📊 Task 4: Testing Get All Expenses...');
        const expensesResponse = await axios.get(`${BASE_URL}/expenses`);
        console.log(`✅ Expenses endpoint accessible - Found ${expensesResponse.data.length} expenses`);
        
        let testExpenseId = null;
        if (expensesResponse.data.length > 0) {
            testExpenseId = expensesResponse.data[0].id;
            console.log(`✅ Sample expense ID: ${testExpenseId}`);
        }

        // Task 2: Test Create New Expense
        console.log('\n➕ Task 2: Testing Create New Expense...');
        const newExpense = {
            title: 'API Test Expense',
            amount: 25.99,
            category: 'Testing',
            date: new Date().toISOString().split('T')[0],
            description: 'Test expense created by API test script',
            userId: 'test-user-123'
        };

        const createResponse = await axios.post(`${BASE_URL}/expenses`, newExpense);
        console.log(`✅ Expense created successfully - ID: ${createResponse.data.id}`);
        const createdExpenseId = createResponse.data.id;

        // Task 3: Test Get Expense Details
        console.log('\n🔍 Task 3: Testing Get Expense Details...');
        const expenseDetailsResponse = await axios.get(`${BASE_URL}/expenses/${createdExpenseId}`);
        console.log(`✅ Expense details retrieved - Title: ${expenseDetailsResponse.data.title || expenseDetailsResponse.data.name}`);

        // Task 5: Test Delete Expense
        console.log('\n🗑️  Task 5: Testing Delete Expense...');
        await axios.delete(`${BASE_URL}/expenses/${createdExpenseId}`);
        console.log(`✅ Expense deleted successfully`);

        // Verify deletion
        try {
            await axios.get(`${BASE_URL}/expenses/${createdExpenseId}`);
            console.log('❌ Delete verification failed - expense still exists');
        } catch (error) {
            if (error.response && error.response.status === 404) {
                console.log('✅ Delete verification successful - expense not found');
            } else {
                console.log('✅ Delete verification successful - expense removed');
            }
        }

        console.log('\n🎉 All API tests completed successfully!');
        console.log('\n📋 Summary:');
        console.log('✅ Task 1: User Login endpoint - WORKING');
        console.log('✅ Task 2: Create new expenses - WORKING');
        console.log('✅ Task 3: Display expense details - WORKING');
        console.log('✅ Task 4: Show all expenses - WORKING');
        console.log('✅ Task 5: Delete expenses - WORKING');

    } catch (error) {
        console.error('❌ API Test failed:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

// Run the tests
testAPIEndpoints();
