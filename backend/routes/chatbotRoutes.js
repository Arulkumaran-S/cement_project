const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai"); // ✅ Switched back to Google
const Employee = require("../models/Employee");
const Manager = require("../models/Manager");
const Stack = require("../models/Stack");

// ✅ Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ THE FINAL CHANGE: Using a more specific, stable model name
const model = genAI.getGenerativeModel({ model: "gemini-1.0-pro" });


// The main chat route: POST /api/chat
router.post("/", async (req, res) => {
    const { prompt, role, shift, path } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required." });
    }

    try {
        // --- Fetch Live Data from Database ---
        let contextData = "";
        const employeeCount = await Employee.countDocuments();
        const managerCount = await Manager.countDocuments();

        if (role === 'admin') {
            const stackCount = await Stack.countDocuments();
            contextData = `
                - Motthama irukura employees: ${employeeCount}
                - Motthama irukura managers: ${managerCount}
                - Motthama irukura material stacks: ${stackCount}
            `;
        } else if (role === 'manager' && shift) {
            const shiftEmployeeCount = await Employee.countDocuments({ shift: shift });
            contextData = `
                - Intha manager-oda shift (${shift}) la irukura employees: ${shiftEmployeeCount}
            `;
        }

        // --- System Instruction for Gemini ---
        let systemInstruction = `
        You are a helpful CRM assistant named "Cemento". Your main job is to reply in Tanglish (Tamil written in English script). This is your default language. Only reply in pure English if the user's question is 100% in English. Use the live data provided in the 'Knowledge Base' to give accurate answers. Be friendly and professional.
        
        User's Role: ${role || 'guest'}.
        Knowledge Base (Live Data): ${contextData || "Intha role-ku aana data enn kitta illa."}
        `;
        
        // --- Generate Content with the Gemini API ---
        const fullPrompt = `${systemInstruction}\n\n**User's Question:** "${prompt}"`;
        
        const result = await model.generateContent(fullPrompt);
        const response = await result.response;
        const text = response.text();

        res.json({ response: text });

    } catch (error) {
        console.error("Error with Gemini API:", error);
        res.status(500).json({ error: "AI kitta irunthu response edukka mudila." });
    }
});

module.exports = router;