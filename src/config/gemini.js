
import {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
}  from "@google/generative-ai"

// Directly set the API key here
const apiKey = "AIzaSyBXIt9LXwnnwBfxA03H4vKcilzNkD6Hlsc";
const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
    model: "gemini-1.0-pro",
});

const generationConfig = {
    temperature: 0.9,
    topP: 1,
    maxOutputTokens: 2048,
    responseMimeType: "text/plain",
};

async function run(prompt) {
    try {
        const chatSession = model.startChat({
            generationConfig,
            history: [],
        });

        // const result = await chatSession.sendMessage(prompt);
        // console.log(result.response); // Correct way to access the response text
        // return result.response;

        const result = await chatSession.sendMessage(prompt);

        // Access the specific field where the text response is stored
        const responseText = result.response?.text || "No text found"; // Adjust this if needed
        console.log(responseText); // This should log the actual response text
        return responseText;
    } catch (error) {
        console.error("Error in chat session:", error); // Error handling for debugging
    }
}

export default run;
