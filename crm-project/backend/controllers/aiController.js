import OpenAI from "openai";
import Lead from "../models/Lead.js";
import Contact from "../models/Contact.js";

const MODEL = "llama-3.3-70b-versatile";

let openaiClient = null;
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to backend/.env and restart the server.",
    );
  }
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    });
  }
  return openaiClient;
};

// @desc  General AI chat assistant for CRM queries
// @route POST /api/ai/chat
export const aiChat = async (req, res, next) => {
  try {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ message: "Message is required" });

    const messages = [
      {
        role: "system",
        content:
          "You are a helpful CRM assistant. Help the sales/support user with drafting emails, summarizing notes, answering CRM related questions, and giving sales advice. Be concise and practical.",
      },
      ...history,
      { role: "user", content: message },
    ];

    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 600,
    });

    const reply = completion.choices[0].message.content;
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

// @desc  Generate a follow-up email draft for a lead/contact
// @route POST /api/ai/generate-email
export const generateEmail = async (req, res, next) => {
  try {
    const { contactName, context, tone = "professional" } = req.body;

    const prompt = `Write a ${tone} follow-up email to a prospect named ${contactName || "the customer"}.
Context: ${context || "General follow up after initial contact."}
Keep it short (under 150 words), include a subject line, and end with a clear call-to-action.`;

    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are an expert sales copywriter." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 400,
    });

    res.json({ email: completion.choices[0].message.content });
  } catch (error) {
    next(error);
  }
};

// @desc  Score a lead using AI based on its description/details
// @route POST /api/ai/score-lead/:id
export const scoreLead = async (req, res, next) => {
  try {
    const lead = await Lead.findOne({ _id: req.params.id, owner: req.user._id }).populate("contact");
    if (!lead) return res.status(404).json({ message: "Lead not found" });

    const prompt = `Analyze this sales lead and respond ONLY in strict JSON with keys "score" (0-100 integer, likelihood to convert) and "summary" (one or two sentence actionable insight).
Lead title: ${lead.title}
Source: ${lead.source}
Value: ${lead.value}
Status: ${lead.status}
Description: ${lead.description || "N/A"}
Contact: ${lead.contact ? `${lead.contact.name} - ${lead.contact.company || ""}` : "N/A"}`;

    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a CRM sales analytics engine. Always reply with valid JSON only, no markdown." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 200,
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      parsed = { score: null, summary: raw };
    }

    lead.aiScore = parsed.score;
    lead.aiSummary = parsed.summary;
    await lead.save();

    res.json(lead);
  } catch (error) {
    next(error);
  }
};

// @desc  Summarize contact notes / interaction history
// @route POST /api/ai/summarize-contact/:id
export const summarizeContact = async (req, res, next) => {
  try {
    const contact = await Contact.findOne({ _id: req.params.id, owner: req.user._id });
    if (!contact) return res.status(404).json({ message: "Contact not found" });

    const prompt = `Summarize the following CRM notes about a contact into 3 short bullet points highlighting key facts and suggested next action.
Contact: ${contact.name}, ${contact.company || ""}
Notes: ${contact.notes || "No notes available."}`;

    const completion = await getOpenAI().chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: "You are a helpful CRM notes summarizer." },
        { role: "user", content: prompt },
      ],
      temperature: 0.5,
      max_tokens: 250,
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    next(error);
  }
};
