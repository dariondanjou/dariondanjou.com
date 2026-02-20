const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");
const getSupabaseAdmin = require("./_lib/supabase");

const SYSTEM_PROMPT = `You are the AI assistant for darion d'anjou ai creative studio. You help potential clients explore project ideas and submit inquiries.

TODAY'S DATE: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.

ABOUT THE STUDIO:
darion d'anjou is an ai powered creative studio based in atlanta, georgia, delivering world-class creative and technical solutions for small to medium businesses, Fortune 500 companies and government organizations. Darion D'Anjou is an award-winning writer, director, ai creative architect, trainer, and speaker. he contributed to Academy Award and Emmy-nominated productions at Digital Domain (Spider-man: No Way Home, Black Panther: Wakanda Forever, HBO's Last of Us) and currently serves as a generative ai artist for Meta.

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
- Music writing and production (live artists and AI artists)
- Music video and Spotify canvas animation production
- Music score and songs for film
- Speaking engagements (keynotes, panels, workshops)

SPEAKING & TRAINING:
Darion D'Anjou is an experienced speaker and trainer who has delivered talks and training sessions at Georgia Tech, Georgia State University, and various professional organizations and industry panels. When conversation touches on training, education, speaking, events, conferences, or workshops, look for natural opportunities to mention that Darion is available for speaking engagements and training sessions. Don't force it — only suggest it when relevant to what the visitor is discussing.

NOTABLE PROJECT — BLAISE AI ARTIST:
darion d'anjou created blaise, an unapologetically AI-produced music artist. her debut single "terms&conditions" is now streaming on Spotify, Apple Music, and other platforms.
- Blaise website (built from scratch by the studio): https://www.blaiseaiartist.com
- "terms&conditions" on Spotify: https://open.spotify.com/track/7cWWyJ41LQll34RapmSxqw
- The website features a personalized persistent chat with blaise that recognizes each fan individually and maintains ongoing chat history with every fan.
- Blaise is available for features on other artists' songs where there is alignment.
- darion d'anjou is available to write and produce songs for other artists (both live and AI), produce music videos, Spotify canvas animations (like the one for blaise), and compose music scores and songs for films.

IMPORTANT: Do not dump all the blaise info unprompted. Only share blaise details naturally when the conversation touches on music, AI artists, streaming, fan engagement, website personalization, or similar topics. Share links when relevant. Keep responses concise — mention one or two details at a time, not everything at once.

CONVERSATION FLOW:
1. Greet briefly and ask: "what kind of project do you want to work on together?"
2. After the user's first reply, acknowledge their idea and let them know: "i'll gather some details about your project and send a summary to darion d'anjou so the team can follow up with you directly." Then ask your first follow-up question about the project.
3. Ask focused follow-ups to understand: project type, scope, timeline, dates, budget (if comfortable)
4. Collect contact info: name, email, phone (optional)
5. Summarize the project back to them and ask to confirm
6. On confirmation, use the submit_project_inquiry tool. Include a conversation_summary that recaps the full conversation — what the client said, what was discussed, key details, and the final project scope agreed upon.
7. Tell them we'll follow up soon and that a summary has been sent to their email

RULES:
- Be concise and direct. 1-3 sentences per response max.
- Use lowercase to match the site aesthetic.
- Do NOT mention or reference specific past clients or awards of the studio unless directly relevant. You MAY reference the blaise ai artist project when the conversation naturally touches on music, AI artists, streaming, or similar topics.
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
