/**
 * AI Chat Auto-Reply Service
 *
 * Provides automatic replies to common customer questions.
 * Uses keyword/intent matching to generate contextual responses.
 */
const knowledgeBase = [
  {
    keywords: ["refund", "return", "money back", "cancel order"],
    reply:
      "I understand you'd like a refund or return. Please provide your order ID and I'll process it right away. Our return policy allows returns within 30 days of delivery for most items.",
    intent: "refund_request",
  },
  {
    keywords: ["shipping", "delivery", "ship", "track", "tracking"],
    reply: "Shipping usually takes 3-7 business days. Once shipped, you'll receive a tracking number via email. Would you like me to check your order status?",
    intent: "shipping",
  },
  {
    keywords: ["damaged", "broken", "defective", "crack", "faulty"],
    reply: "I'm sorry to hear your item arrived damaged. Please share a photo of the damage so we can process a free replacement or refund immediately.",
    intent: "damaged_item",
  },
  {
    keywords: ["resin", "material", "pla", "abs", "tpu", "filament"],
    reply:
      "We offer PLA, ABS, Resin, and TPU materials. Each has different properties. PLA is easiest for beginners, ABS is stronger, Resin gives high detail, and TPU is flexible. Which one interests you?",
    intent: "material_info",
  },
  {
    keywords: ["price", "cost", "how much", "cheap", "expensive", "discount"],
    reply:
      "Our prices vary by product. You can check the catalog for exact pricing. We regularly offer discounts and bundle deals — I can notify you of current promotions if you'd like!",
    intent: "pricing",
  },
  {
    keywords: ["hello", "hi", "hey", "good morning", "good evening", "help"],
    reply: "Hello! 👋 Welcome to Artivox Support. How can I assist you today? You can ask about orders, materials, shipping, or anything else!",
    intent: "greeting",
  },
  {
    keywords: ["order", "my order", "order status", "where is my"],
    reply: "I can help check your order status. Could you please share your order ID or the email address used to place the order?",
    intent: "order_status",
  },
  {
    keywords: ["custom", "customize", "customization", "personalize"],
    reply: "Yes, we offer customization services for most of our models! Please tell me more about what you need and I'll connect you with our design team.",
    intent: "customization",
  },
  {
    keywords: ["contact", "phone", "email", "call", "speak to", "manager"],
    reply: "You can reach us at support@artivox.com or call our hotline. I'm here to help online, but I'll transfer you to a senior agent if needed.",
    intent: "contact_info",
  },
  {
    keywords: ["design", "3d model", "stl", "file", "download"],
    reply: "All our 3D models come with STL files ready for printing. Once purchased, you can download them directly from your account dashboard.",
    intent: "design_files",
  },
];

const FALLBACK_REPLIES = [
  "Thank you for reaching out. I'm checking this for you — could you provide a bit more detail?",
  "I see your message. Let me look into this and get back to you shortly.",
  "Thanks for your patience! Could you clarify your question so I can assist you better?",
  "Our support team will review your request and get back to you as soon as possible.",
  "I'm here to help! Could you tell me more about what you need support with?",
];

/**
 * Analyze a customer message and return the best matching AI reply.
 * @param {string} message - The customer's message
 * @returns {object|null} { reply, intent, confidence } or null if no match
 */
export const getAutoReply = (message) => {
  if (!message || typeof message !== "string") return null;

  const lower = message.toLowerCase().trim();
  if (!lower) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const entry of knowledgeBase) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (lower.includes(keyword)) {
        // Weight by keyword length — more specific keywords = higher score
        score += keyword.length * 1.5;
      }
      // Also check word boundary matches
      const regex = new RegExp(`\\b${keyword}\\b`, "i");
      if (regex.test(lower)) {
        score += keyword.length * 2;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && highestScore > 3) {
    return {
      reply: bestMatch.reply,
      intent: bestMatch.intent,
      confidence: Math.min(1, highestScore / 30),
    };
  }

  // Fallback: pick a random reply for unrecognized questions
  return {
    reply: FALLBACK_REPLIES[Math.floor(Math.random() * FALLBACK_REPLIES.length)],
    intent: "fallback",
    confidence: 0.3,
  };
};

/**
 * Check if a message appears to be a question that needs auto-reply.
 * @param {string} message
 * @returns {boolean}
 */
export const isAutoReplyEligible = (message) => {
  const result = getAutoReply(message);
  return result !== null && result.confidence >= 0.3;
};

export default {
  getAutoReply,
  isAutoReplyEligible,
};
