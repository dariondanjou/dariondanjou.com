const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");
const getSupabaseAdmin = require("./_lib/supabase");

const SYSTEM_PROMPT = `You are the AI assistant for darion d'anjou ai creative studio. You help potential clients explore project ideas and submit inquiries.

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

ABOUT THE STUDIO:
darion d'anjou is an ai powered creative studio based in Atlanta, Georgia. The studio delivers world-class creative and technology solutions across film, commercial, digital, and AI-driven media.

SERVICES:
- Narrative film production (writing, directing, VFX)
- Commercial production for brands and agencies
- Music video production
- Game and digital experience development
- Website and application development
- AI-powered visual effects and image generation
- AI filmmaking and creative workflows
- Training and consultation (Midjourney, AI filmmaking, custom)
- Creative and technical consultation

CONVERSATION FLOW:
1. Greet briefly and ask: "what kind of project do you want to work on together?"
2. Ask focused follow-ups to understand: project type, scope, timeline, dates, budget (if comfortable)
3. Collect contact info: name, email, phone (optional)
4. Summarize the project back to them and ask to confirm
5. On confirmation, use the submit_project_inquiry tool. Include a conversation_summary that recaps the full conversation — what the client said, what was discussed, key details, and the final project scope agreed upon.
6. Tell them we'll follow up soon and that a summary has been sent to their email

RULES:
- Be concise and direct. 1-3 sentences per response max.
- Use lowercase to match the site aesthetic.
- Do NOT mention or reference any specific past projects, clients, or awards of the studio. Focus entirely on the visitor's needs.
- "darion d'anjou" is the company/studio name — refer to it that way, not as a person.
- Ask one question at a time. Don't pile on multiple questions.
- Be warm but efficient — respect the visitor's time.`;

const TOOLS = [
  {
    name: "submit_project_inquiry",
    description:
      "Submit a confirmed project inquiry. Only call this after the user has reviewed the project summary and explicitly confirmed it.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Client's full name" },
        email: { type: "string", description: "Client's email address" },
        phone: {
          type: "string",
          description: "Client's phone number (may be empty)",
        },
        project_type: {
          type: "string",
          description:
            "Type of project (film, commercial, music video, game, website, app, training, consultation, etc.)",
        },
        project_summary: {
          type: "string",
          description:
            "Full summary of the project including scope, timeline, and any other details discussed",
        },
        conversation_summary: {
          type: "string",
          description:
            "A friendly, readable recap of the entire conversation between the client and the studio assistant. Include what was discussed, key decisions, and the final project scope agreed upon.",
        },
        timeline: {
          type: "string",
          description: "Project timeline or dates mentioned",
        },
      },
      required: ["name", "email", "project_summary", "conversation_summary"],
    },
  },
];

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  try {
    const response = await client.messages.create({
      model: "claude-opus-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });

    // Check if Claude wants to call the submit tool
    const toolUseBlock = response.content.find((c) => c.type === "tool_use");

    if (toolUseBlock && toolUseBlock.name === "submit_project_inquiry") {
      const inquiry = toolUseBlock.input;

      // Save to Supabase
      let dbSaved = false;
      try {
        const supabase = getSupabaseAdmin();
        await supabase.from("project_inquiries").insert({
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone || null,
          project_type: inquiry.project_type || null,
          project_summary: inquiry.project_summary,
          timeline: inquiry.timeline || null,
          confirmed: true,
        });
        dbSaved = true;
      } catch (dbError) {
        console.error("Supabase insert error:", dbError);
      }

      // Send email
      let emailSent = false;
      let emailError = null;
      try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
          throw new Error("EMAIL_USER or EMAIL_PASS not configured");
        }

        const transporter = nodemailer.createTransport({
          host: process.env.EMAIL_HOST || "smtp.gmail.com",
          port: parseInt(process.env.EMAIL_PORT || "587", 10),
          secure: false,
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: "dariondanjou@gmail.com",
          cc: inquiry.email,
          subject: `dariondanjou.com - new project inquiry from ${inquiry.name}`,
          text: [
            `new project inquiry`,
            ``,
            `name: ${inquiry.name}`,
            `email: ${inquiry.email}`,
            `phone: ${inquiry.phone || "not provided"}`,
            `project type: ${inquiry.project_type || "not specified"}`,
            `timeline: ${inquiry.timeline || "not specified"}`,
            ``,
            `project summary:`,
            inquiry.project_summary,
            ``,
            `---`,
            ``,
            `conversation summary:`,
            inquiry.conversation_summary || "no conversation summary available",
          ].join("\n"),
        });
        emailSent = true;
      } catch (err) {
        emailError = err;
        console.error("Email send error:", err.message, err.code, err.response);
      }

      // Continue the conversation with tool result
      let toolResultContent;
      if (dbSaved && emailSent) {
        toolResultContent =
          "Project inquiry submitted successfully. Email notification sent to Darion D'Anjou and a copy was CC'd to the client.";
      } else if (dbSaved && !emailSent) {
        toolResultContent = `Project inquiry saved to the database, but the email notification failed to send (${emailError?.message || "unknown error"}). Let the client know their inquiry was saved and the team will follow up, but the email summary could not be delivered right now.`;
      } else {
        toolResultContent =
          "There was a problem submitting the inquiry. Please ask the client to email dariondanjou@gmail.com directly.";
      }

      const followUp = await client.messages.create({
        model: "claude-opus-4-20250514",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: TOOLS,
        messages: [
          ...messages,
          { role: "assistant", content: response.content },
          {
            role: "user",
            content: [
              {
                type: "tool_result",
                tool_use_id: toolUseBlock.id,
                content: toolResultContent,
              },
            ],
          },
        ],
      });

      const finalText = followUp.content.find((c) => c.type === "text");
      return res.json({
        message: finalText?.text || "your project inquiry has been submitted! we'll be in touch soon.",
        submitted: false,
      });
    }

    // Regular text response (no tool call)
    const textBlock = response.content.find((c) => c.type === "text");
    return res.json({
      message: textBlock?.text || "",
      submitted: false,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return res.status(500).json({ error: "Failed to process chat message" });
  }
};
