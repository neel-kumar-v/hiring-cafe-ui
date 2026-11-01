export type QuickActionKind =
  | "interested"
  | "availability"
  | "not-interested"
  | "custom-reply"
  | "company-site"
  | "recruiter-link"
  | "view-roles"
  | "mute"
  | "request-info"
  | "referral";

export interface ThreadQuickAction {
  id: string;
  kind: QuickActionKind;
  label?: string;
  url?: string;
  replyText?: string;
}

export interface MailThread {
  id: string;
  name: string;
  email: string;
  company: string;
  companyDomain?: string;
  companyLogo?: string;
  subject: string;
  text: string;
  date: string;
  timestamp: string;
  unread: boolean;
  quickActions?: ThreadQuickAction[];
}

/**
 * Strips salutations / greetings (e.g. "Hi there,", "Hey,", "Hello [name],", "Good morning,")
 * from the start of an email body so the preview snippet begins with the real message content.
 */
export function getMessagePreview(text: string): string {
  if (!text) return "";
  const cleaned = text
    .replace(
      /^(?:(?:hi|hey|hello|dear|greetings|good\s+(?:morning|afternoon|evening))\b[^\n]*\n*)+/i,
      ""
    )
    .trim();
  return cleaned || text;
}

export const DEMO_MAIL_THREADS: MailThread[] = [
  {
    id: "thread-1",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    company: "Stripe",
    companyDomain: "stripe.com",
    subject: "Staff Frontend Engineer role at Stripe",
    text: "Hi there,\n\nI came across your profile and was really impressed by your background in full-stack TypeScript and frontend performance. We're actively growing our Merchant Experience team here at Stripe and looking for a Staff Frontend Engineer to lead core architectural initiatives.\n\nGiven your experience with high-scale web applications, I think this could be a great match. Would you be open to a 15-minute introductory chat sometime this week?\n\nBest,\nSarah Jenkins\nSenior Technical Recruiter, Stripe",
    date: "2d",
    timestamp: "Today, 10:15 AM",
    unread: true,
    quickActions: [
      { id: "act-interested", kind: "interested", label: "Interested" },
      { id: "act-avail", kind: "availability", label: "Give availability" },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Not interested" },
      { id: "act-site", kind: "company-site", label: "Stripe site" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-2",
    name: "David Chen",
    email: "david.chen@example.com",
    company: "Linear",
    companyDomain: "linear.app",
    subject: "Product Engineering Lead at Linear",
    text: "Hey,\n\nI lead engineering recruiting at Linear. Your recent work on reactive user interfaces caught our eye. We are looking for a Product Engineering Lead to spearhead our next-generation sync and desktop workflows.\n\nOur team is small, high-density, and heavily values craftsmanship. You can view the role spec here: https://linear.app/careers\n\nLet me know if you'd like to have a quick call with our engineering director.\n\nCheers,\nDavid",
    date: "4d",
    timestamp: "Yesterday, 3:30 PM",
    unread: true,
    quickActions: [
      { id: "act-spec", kind: "recruiter-link", label: "View Linear spec", url: "https://linear.app/careers" },
      {
        id: "act-call",
        kind: "interested",
        label: "Connect with Director",
        replyText: "Hi David,\n\nI'd love to chat with your engineering director about the Product Engineering Lead role and Linear's sync engine roadmap. When would be a good time to set that up?",
      },
      { id: "act-avail", kind: "availability", label: "Give availability" },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Not interested" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-3",
    name: "Elena Rostova",
    email: "elena.rostova@example.com",
    company: "Vercel",
    companyDomain: "vercel.com",
    subject: "Senior Design Technologist @ Vercel",
    text: "Hi,\n\nI hope your week is going well! I'm reaching out from Vercel's talent team. We love what you've built in the modern web ecosystem, especially your focus on developer tools and polish.\n\nWe're searching for a Senior Design Technologist to bridge our design systems and Next.js developer workflows. Are you exploring new opportunities right now?\n\nWarmly,\nElena",
    date: "1w",
    timestamp: "Oct 18, 2024, 2:15 PM",
    unread: false,
    quickActions: [
      { id: "act-interested", kind: "interested", label: "Exploring opportunities" },
      {
        id: "act-spec",
        kind: "request-info",
        label: "Request role spec",
        replyText: "Hi Elena,\n\nThanks for reaching out! I'm curious to learn more about how this role bridges design systems and Next.js. Could you share the role specification?",
      },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Not right now" },
      { id: "act-site", kind: "company-site", label: "Vercel site" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-4",
    name: "Marcus Vance",
    email: "marcus.vance@example.com",
    company: "Anthropic",
    companyDomain: "anthropic.com",
    subject: "Founding UI Engineer - Claude Workspace",
    text: "Hello,\n\nI'm Marcus, recruiting for the frontend systems team at Anthropic. We're assembling a specialized group focused on rich collaborative interfaces for AI workspaces.\n\nYour profile stood out to our hiring manager for this role. If you are open to learning more about what we're building, I'd love to connect and share some details.\n\nBest regards,\nMarcus Vance",
    date: "2w",
    timestamp: "Oct 14, 2024, 11:00 AM",
    unread: false,
    quickActions: [
      { id: "act-interested", kind: "interested", label: "Interested in Claude UI" },
      {
        id: "act-roadmap",
        kind: "request-info",
        label: "Ask about roadmap",
        replyText: "Hi Marcus,\n\nThanks for thinking of me! The Claude Workspace team sounds fascinating. I'd love to learn more about the technical challenges and roadmap you're tackling before setting up a call.",
      },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Pass for now" },
      { id: "act-site", kind: "company-site", label: "Anthropic site" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-5",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    company: "Figma",
    companyDomain: "figma.com",
    subject: "Staff Systems Engineer - Editor Infrastructure",
    text: "Hi,\n\nI hope this email finds you well! I'm on the technical sourcing team at Figma. We're scaling our Editor Infrastructure team and looking for engineers who thrive at the intersection of web performance, Canvas/WebGL, and complex state engines.\n\nI'd love to chat about our technical roadmap and see if this aligns with what you'd be looking for in your next chapter. What does your availability look like this Thursday or Friday?\n\nBest,\nPriya",
    date: "3w",
    timestamp: "Oct 10, 2024, 4:45 PM",
    unread: false,
    quickActions: [
      { id: "act-avail", kind: "availability", label: "Give Thu/Fri times" },
      { id: "act-interested", kind: "interested", label: "Interested" },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Decline" },
      { id: "act-site", kind: "company-site", label: "Figma site" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-6",
    name: "Sarah Jenkins",
    email: "sarah.jenkins@example.com",
    company: "Stripe",
    companyDomain: "stripe.com",
    subject: "Following up - Staff Frontend Engineer at Stripe",
    text: "Hi again,\n\nJust floating my earlier note back to the top of your inbox. The Merchant Experience team is still hiring a Staff Frontend Engineer, and the hiring manager asked me to reach out a second time.\n\nThe role is fully remote within the US or Canada, the interview loop is four conversations over two weeks, and I can share the full job description whenever you'd like it.\n\nWould a 20-minute call sometime next week be useful?\n\nBest,\nSarah Jenkins\nSenior Technical Recruiter, Stripe",
    date: "3w",
    timestamp: "Oct 9, 2024, 1:20 PM",
    unread: false,
    quickActions: [
      { id: "act-avail", kind: "availability", label: "Book 20-min call" },
      {
        id: "act-interested",
        kind: "interested",
        label: "Accept follow-up",
        replyText: "Hi Sarah,\n\nThanks for following up! Yes, a 20-minute call next week would be great. Please send over the job description as well.",
      },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Decline follow-up" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-7",
    name: "Jonah Feldman",
    email: "jonah.feldman@example.com",
    company: "Notion",
    companyDomain: "notion.so",
    subject: "Product Engineer, Editor Experiences - Notion",
    text: "Hello there,\n\nI run hiring for the Editor Experiences group at Notion. We are building collaborative editing surfaces that stay fast with thousands of concurrent editors, and I think your background in local-first state would be a strong fit.\n\nWe are also remote-friendly, with hubs in San Francisco, New York, and Dublin. The team ships to production every week, and the interview loop is hands-on: a paid work sample, a system design session, and two team conversations.\n\nIf you are open to it, I can send over the job post and set up an intro with the engineering manager.\n\nThanks,\nJonah",
    date: "1m",
    timestamp: "Oct 3, 2024, 11:10 AM",
    unread: false,
    quickActions: [
      {
        id: "act-jobpost",
        kind: "request-info",
        label: "Request job post",
        replyText: "Hi Jonah,\n\nThanks for reaching out! Yes, please send over the job post—I'd be glad to review the details.",
      },
      {
        id: "act-intro",
        kind: "interested",
        label: "Meet with EM",
        replyText: "Hi Jonah,\n\nThanks for getting in touch! An intro chat with the engineering manager sounds great. I'd love to learn more about the editor infrastructure.",
      },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Pass" },
      { id: "act-roles", kind: "view-roles", label: "Notion roles" },
      { id: "act-mute", kind: "mute" },
    ],
  },
  {
    id: "thread-8",
    name: "Amara Okafor",
    email: "amara.okafor@example.com",
    company: "Ramp",
    companyDomain: "ramp.com",
    subject: "Design Systems Engineer - Ramp",
    text: "Hi,\n\nI'm Amara from the design systems team at Ramp. We are looking for an engineer to own the component library and the tooling around it: tokens, documentation, accessibility, and the build pipeline that ships it to product teams.\n\nMost of the work is TypeScript and React, with a lot of attention paid to visual regression testing and rendering performance in dense data tables.\n\nI'd love to hear what you're looking for next and share how we work. Would you be open to a short intro call this week?\n\nBest,\nAmara Okafor\nTechnical Recruiter, Ramp",
    date: "1m",
    timestamp: "Sep 27, 2024, 9:05 AM",
    unread: false,
    quickActions: [
      { id: "act-interested", kind: "interested", label: "Open to chat" },
      {
        id: "act-refer",
        kind: "referral",
        label: "Refer someone",
        replyText: "Hi Amara,\n\nThanks for reaching out! I'm not currently looking for a transition, but I know a couple of great frontend/design-systems engineers who might be interested. Would you like me to introduce you?",
      },
      { id: "act-custom", kind: "custom-reply", label: "Custom reply" },
      { id: "act-decline", kind: "not-interested", label: "Not looking" },
      { id: "act-site", kind: "company-site", label: "Ramp site" },
      { id: "act-mute", kind: "mute" },
    ],
  },
];
