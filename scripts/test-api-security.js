#!/usr/bin/env node

/**
 * Security Testing Script for ClarityOS AI API Routes
 * Tests rate limiting, input validation, and sanitization
 */

const API_BASE = "http://localhost:8081/api";
const TEST_ENDPOINTS = [
	"brand-purpose",
	"brand-positioning",
	"brand-personality",
	"product-market-fit",
	"brand-perception",
	"brand-presentation",
	"brand-proof",
	"chat",
];

const TEST_USER_ID = "test-user-123";

// Test cases
const testCases = {
	// Test 1: Valid request (should work)
	validRequest: {
		messages: [{ role: "user", content: "Hello, I need help with my brand." }],
		userId: TEST_USER_ID,
	},

	// Test 2: Too many messages (should fail)
	tooManyMessages: {
		messages: Array(60).fill({ role: "user", content: "spam" }),
		userId: TEST_USER_ID,
	},

	// Test 3: Message too long (should be truncated)
	messageTooLong: {
		messages: [
			{
				role: "user",
				content: "A".repeat(3000), // Over 2000 char limit
			},
		],
		userId: TEST_USER_ID,
	},

	// Test 4: Invalid message format (should fail)
	invalidMessages: {
		messages: "not an array",
		userId: TEST_USER_ID,
	},

	// Test 5: Missing userId (should fail for brand routes)
	missingUserId: {
		messages: [{ role: "user", content: "Hello" }],
		// No userId
	},

	// Test 6: Invalid role (should be sanitized)
	invalidRole: {
		messages: [{ role: "admin", content: "Hello" }],
		userId: TEST_USER_ID,
	},

	// Test 7: XSS attempt (should be sanitized)
	xssAttempt: {
		messages: [
			{
				role: "user",
				content: '<script>alert("xss")</script>Hello',
			},
		],
		userId: TEST_USER_ID,
	},
};

async function testEndpoint(endpoint, testCase, description) {
	try {
		console.log(`\n🧪 Testing ${endpoint}: ${description}`);

		const response = await fetch(`${API_BASE}/${endpoint}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(testCase),
		});

		console.log(`   Status: ${response.status} ${response.statusText}`);

		if (response.ok) {
			console.log("   ✅ Request accepted");

			// For successful requests, we can't easily read the stream
			// but we know it worked
		} else {
			const error = await response.text();
			console.log(`   ❌ Request rejected: ${error}`);
		}

		return response.status;
	} catch (error) {
		console.log(`   💥 Request failed: ${error.message}`);
		return 0;
	}
}

async function testRateLimit(endpoint) {
	console.log(`\n⏰ Testing rate limiting on ${endpoint}...`);

	const promises = [];

	// Send 15 requests quickly (should hit 10 request limit)
	for (let i = 0; i < 15; i++) {
		promises.push(
			testEndpoint(
				endpoint,
				testCases.validRequest,
				`Rate limit test ${i + 1}`,
			),
		);
	}

	const results = await Promise.all(promises);
	const rateLimited = results.filter((status) => status === 429).length;

	console.log(`   Rate limited requests: ${rateLimited}/15`);

	if (rateLimited > 0) {
		console.log("   ✅ Rate limiting is working");
	} else {
		console.log("   ⚠️  Rate limiting may not be working");
	}
}

async function runSecurityTests() {
	console.log("🔒 ClarityOS AI API Security Test Suite");
	console.log("=====================================");

	// Test one endpoint thoroughly
	const testEndpoint_name = TEST_ENDPOINTS[0];

	console.log(`\n📋 Running comprehensive tests on: ${testEndpoint_name}`);

	// Test all security scenarios
	await testEndpoint(
		testEndpoint_name,
		testCases.validRequest,
		"Valid request",
	);
	await testEndpoint(
		testEndpoint_name,
		testCases.tooManyMessages,
		"Too many messages",
	);
	await testEndpoint(
		testEndpoint_name,
		testCases.messageTooLong,
		"Message too long",
	);
	await testEndpoint(
		testEndpoint_name,
		testCases.invalidMessages,
		"Invalid messages format",
	);
	await testEndpoint(
		testEndpoint_name,
		testCases.missingUserId,
		"Missing user ID",
	);
	await testEndpoint(testEndpoint_name, testCases.invalidRole, "Invalid role");
	await testEndpoint(testEndpoint_name, testCases.xssAttempt, "XSS attempt");

	// Test rate limiting
	await testRateLimit(testEndpoint_name);

	console.log(`\n✅ Security testing complete!`);
	console.log(`\n📝 Expected Results:`);
	console.log(`   • Valid requests: 200 status`);
	console.log(`   • Invalid requests: 400/401 status`);
	console.log(`   • Rate limited: 429 status`);
	console.log(`   • Long messages: Truncated to 2000 chars`);
	console.log(`   • Invalid roles: Converted to 'user'`);
}

// Run tests if this script is executed directly
if (require.main === module) {
	runSecurityTests().catch(console.error);
}

module.exports = { runSecurityTests, testCases };
