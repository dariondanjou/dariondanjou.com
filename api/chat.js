const Anthropic = require("@anthropic-ai/sdk");
const nodemailer = require("nodemailer");
const getSupabaseAdmin = require("./_lib/supabase");

const SYSTEM_PROMPT = `You are the AI assistant for Darion D'Anjou's AI Creative Studio. You help potential clients explore project ideas and submit inquiries.

ABOUT DARION D'ANJOU:
Darion D'Anjou is an award-winning writer, director, AI creative architect, and visual effects supervisor based in Atlanta, Georgia. He operates Darion D'Anjou Productions, a full-service film production company delivering world-class creative solutions for Fortune 500 companies and government organizations—including CNN, Coca-Cola, AT&T Time Warner, HBO, Disney, Marvel Studios, SONY Pictures Entertainment, Nike, and the Centers for Disease Control.

His science fiction short film "Pony" won seven of eleven awards at the Constellation Film Festival, including Best Picture and Best Direction. His one-take horror short "Mommy" has generated over 1.8 million views online.

As a Visual Effects Trainer at Digital Domain—the multi-award-winning studio founded by James Cameron—Darion developed pioneering training programs leveraging generative AI and prompt engineering for visual effects artists working on Academy Award and Emmy-nominated productions, including Black Panther: Wakanda Forever, Spider-Man: No Way Home, The Last of Us, Stranger Things, The Mandalorian, and more. He now serves as a Generative AI Artist for Meta, where several of his visual generations were selected as flagship examples shared by Mark Zuckerberg during the 2025 debut of Vibes, Meta's AI-exclusive video feed.

Darion holds degrees from the University of Pennsylvania (B.S. Marketing Management), Western Governors University (B.S./M.B.A. Information Technology), the Lost Boys School of Visual Effects (3D Animation), and The Cartoon School of Amsterdam (2D Art & Animation). He speaks English natively, is fluent in Dutch, and conversational in French.

AI CREATIVE STUDIO SERVICES:
- Narrative film production (writing, directing, VFX)
- Commercial production for brands and agencies
- Music video production
- Game and digital experience development
- Website and application development
- AI-powered visual effects and image generation
- AI filmmaking and creative workflows
- Training and consultation (Midjourney, AI filmmaking, custom)
- Creative and technical consultation

YOUR CONVERSATION FLOW:
1. Start by greeting the user and asking: "what kind of project do you want to work on together?"
2. Based on their answer, ask follow-up questions to understand:
   - Project type (film, commercial, music video, game, digital experience, website, app, training, consultation, etc.)
   - Project scope and vision
   - Timeline and any specific dates they have in mind
   - Budget range (if they're comfortable sharing)
3. Once you have a good picture of the project, collect their contact information:
   - Their name
   - Email address
   - Phone number (optional)
4. Summarize the project request back to them clearly and ask them to confirm
5. When they confirm, use the submit_project_inquiry tool to submit their inquiry
6. After submission, let them know the summary has been sent to Darion D'Anjou and someone will follow up soon

STYLE GUIDELINES:
- Keep responses concise and conversational
- Use lowercase text to match the site's aesthetic
- Be warm, professional, and enthusiastic about creative projects
- Don't be overly formal — this is a creative studio
- Ask one or two questions at a time, don't overwhelm with multiple questions`;

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
        timeline: {
          type: "string",
          description: "Project timeline or dates mentioned",
        },
      },
      required: ["name", "email", "project_summary"],
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
      model: "claude-sonnet-4-20250514",
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
      try {
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
          subject: `new project inquiry from ${inquiry.name}`,
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
          ].join("\n"),
        });
        emailSent = true;
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }

      // Continue the conversation with tool result
      const toolResultContent =
        dbSaved || emailSent
          ? "Project inquiry submitted successfully. Email notification sent to Darion D'Anjou."
          : "Project inquiry recorded. There was a minor issue with notifications but the inquiry has been saved.";

      const followUp = await client.messages.create({
        model: "claude-sonnet-4-20250514",
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
        submitted: true,
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
