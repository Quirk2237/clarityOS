const { exec } = require("child_process");
const util = require("util");

const execAsync = util.promisify(exec);

// --- Test Configuration ---
// IMPORTANT: Replace with your actual Supabase project URL and a valid Anon Key.
// You can get these from your Supabase project's API settings.
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const FUNCTION_NAME = "ai-handler";

const testPayload = {
	task: "purpose",
	userId: `test-user-${Date.now()}`,
	messages: [
		{
			role: "user",
			content: "I want to build a brand that sells high-quality, sustainable artisanal coffee beans.",
		},
	],
};
// --------------------------

// Helper function to log with style
const log = (message, color = "\x1b[0m") => console.log(`${color}${message}\x1b[0m`);
const green = (text) => `\x1b[32m${text}\x1b[0m`;
const red = (text) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text) => `\x1b[36m${text}\x1b[0m`;

async function runTest() {
	log(cyan("🚀 Starting AI Handler Flow Test..."));

	// 1. Validate environment variables
	log("\n🔍 [Step 1/3] Validating environment variables...");
	if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
		log(red("❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set in your environment."));
		log(yellow("Please create a .env file and add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."));
		process.exit(1);
	}
	log(green("✅ Environment variables are present."));

	// 2. Execute the cURL command to call the Edge Function
	const functionUrl = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;
	const curlCommand = `curl -s -w "\\n%{http_code}" -X POST "${functionUrl}" \\
    -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \\
    -H "Content-Type: application/json" \\
    -d '${JSON.stringify(testPayload)}'`;

	log(cyan(`\n📡 [Step 2/3] Executing request to Edge Function at ${functionUrl}...`));
	log(yellow(`Payload: ${JSON.stringify(testPayload, null, 2)}`));

	let responseBody;
	let httpCode;
	let hasCurlError = false;

	try {
		const { stdout, stderr } = await execAsync(curlCommand);

		if (stderr) {
			log(red(`❌ cURL stderr: ${stderr}`));
			hasCurlError = true;
		}

		const outputLines = stdout.trim().split("\n");
		httpCode = parseInt(outputLines.pop(), 10);
		responseBody = outputLines.join("\n");
	
	} catch (error) {
		log(red(`❌ Critical error executing cURL: ${error.message}`));
		hasCurlError = true;
	}

	if (hasCurlError) {
		log(red("\n❌ Test Failed: The cURL command to the Edge Function failed. Cannot proceed."),);
		process.exit(1);
	}

	log(green(`✅ Received HTTP Status Code: ${httpCode}`));
	log(yellow(`Response Body Preview: ${responseBody.substring(0, 200)}...`));


	// 3. Analyze the response
	log(cyan("\n🧐 [Step 3/3] Analyzing the response..."));
	let isTestSuccessful = true;

	if (httpCode !== 200) {
		log(red(`❌ Test Failed: Expected HTTP status 200, but got ${httpCode}.`));
		isTestSuccessful = false;
	} else {
		log(green("✅ HTTP status is 200 OK."));
	}

	try {
		// Since the response is a stream of JSON objects, we'll check if it contains expected keys
		if (responseBody.includes(`"question"`) && responseBody.includes(`"scores"`)) {
			log(green("✅ Response body contains the expected structured keys ('question', 'scores')."));
		} else {
			log(red("❌ Test Failed: Response body does not seem to contain the structured JSON from the AI."),);
			isTestSuccessful = false;
		}
	} catch (e) {
		log(red(`❌ Test Failed: Could not parse the response stream. Error: ${e.message}`),);
		isTestSuccessful = false;
	}

	log("\n---");
	if (isTestSuccessful) {
		log(green("🎉🎉🎉 AI Handler Flow Test PASSED! 🎉🎉🎉"));
		log("The Edge Function responded correctly. For a deeper check, manually inspect Supabase logs for any unexpected warnings.");
	} else {
		log(red("😭😭😭 AI Handler Flow Test FAILED. 😭😭😭"));
		log(yellow("Next Steps: Check the Edge Function logs in your Supabase dashboard for errors corresponding to this test's timestamp."));
	}
}

// Helper to load .env file for local testing
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

runTest().catch((err) => {
	log(red(`A critical unexpected error occurred: ${err.message}`));
	process.exit(1);
}); 