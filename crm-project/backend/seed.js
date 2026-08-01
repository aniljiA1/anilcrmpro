// Seed script — populates the database with realistic demo data
// Usage: node seed.js  (seeds data for the first user found, or pass an email: node seed.js user@email.com)

import "dotenv/config";
import mongoose from "mongoose";
import User from "./models/User.js";
import Contact from "./models/Contact.js";
import Lead from "./models/Lead.js";
import Deal from "./models/Deal.js";
import Task from "./models/Task.js";
import Invoice from "./models/Invoice.js";
import Activity from "./models/Activity.js";

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const emailArg = process.argv[2];
    const user = emailArg ? await User.findOne({ email: emailArg }) : await User.findOne().sort({ createdAt: 1 });

    if (!user) {
      console.log("❌ No user found. Please register a user in the app first, then run this script.");
      process.exit(1);
    }

    console.log(`🌱 Seeding demo data for: ${user.name} (${user.email})`);

    // Clear existing demo data for this user (keeps things clean on re-run)
    await Promise.all([
      Contact.deleteMany({ owner: user._id }),
      Lead.deleteMany({ owner: user._id }),
      Deal.deleteMany({ owner: user._id }),
      Task.deleteMany({ owner: user._id }),
      Invoice.deleteMany({ owner: user._id }),
      Activity.deleteMany({ owner: user._id }),
    ]);

    // ---------- CONTACTS ----------
    const contactsData = [
      { name: "Priya Malhotra", email: "priya.malhotra@nimbuslogistics.com", phone: "+91 98200 11223", company: "Nimbus Logistics", jobTitle: "VP of Operations", tags: ["decision-maker", "logistics"], notes: "Met at LogiTech Summit 2026. Very interested in our fleet tracking add-on. Wants a demo for her regional managers next month. Currently using a competitor tool but unhappy with support response times." },
      { name: "Arjun Rao", email: "arjun.rao@brightpathfinance.in", phone: "+91 90210 44556", company: "BrightPath Finance", jobTitle: "Head of IT", tags: ["enterprise", "fintech"], notes: "Evaluating our platform against two competitors. Security and compliance (RBI guidelines) are his top concerns. Requested a security whitepaper." },
      { name: "Sara Thompson", email: "sara.thompson@vertexretail.com", phone: "+1 415 555 0182", company: "Vertex Retail Group", jobTitle: "Director of CRM Strategy", tags: ["retail", "warm-lead"], notes: "Referral from an existing customer. Looking to consolidate 3 different tools into one CRM. Budget approved for Q3." },
      { name: "Karan Mehta", email: "karan.mehta@zenithcorp.co.in", phone: "+91 99887 76655", company: "Zenith Industrial Corp", jobTitle: "Sales Manager", tags: ["manufacturing"], notes: "Small team (8 reps). Price sensitive. Wants monthly billing instead of annual." },
      { name: "Ananya Iyer", email: "ananya.iyer@cloudnineHR.com", phone: "+91 98765 43210", company: "CloudNine HR Solutions", jobTitle: "Founder & CEO", tags: ["startup", "champion"], notes: "Extremely responsive over email. Loves the AI features. Already told her team to start onboarding." },
      { name: "Michael Chen", email: "m.chen@pacificwaveenergy.com", phone: "+1 628 555 0199", company: "Pacific Wave Energy", jobTitle: "Procurement Lead", tags: ["enterprise"], notes: "Long sales cycle expected — this is a 40-person org with a formal procurement process. Needs SOC 2 report." },
      { name: "Neha Kapoor", email: "neha.kapoor@urbanstitch.in", phone: "+91 97531 08642", company: "Urban Stitch Apparel", jobTitle: "Customer Success Head", tags: ["d2c", "retail"], notes: "Wants better visibility into customer complaint trends. Currently using spreadsheets." },
    ];
    const contacts = await Contact.insertMany(contactsData.map((c) => ({ ...c, owner: user._id })));
    const byCompany = Object.fromEntries(contacts.map((c) => [c.company, c]));
    console.log(`   → ${contacts.length} contacts created`);

    // ---------- LEADS ----------
    const leadsData = [
      {
        contact: byCompany["Nimbus Logistics"]._id,
        title: "Fleet tracking add-on — Nimbus Logistics",
        source: "Trade Show",
        status: "Qualified",
        value: 480000,
        aiScore: 82,
        aiSummary: "Strong buying signal — dissatisfied with current vendor and has budget authority. Prioritize a live demo within 2 weeks.",
        description: "Wants fleet tracking rolled out across 6 regional hubs. Decision maker engaged directly.",
      },
      {
        contact: byCompany["BrightPath Finance"]._id,
        title: "Enterprise CRM migration — BrightPath Finance",
        source: "Referral",
        status: "Contacted",
        value: 1250000,
        aiScore: 64,
        aiSummary: "High value but compliance review will slow the cycle. Send security documentation proactively to stay ahead of competitors.",
        description: "Comparing us against 2 competitors. Compliance and data residency are key blockers.",
      },
      {
        contact: byCompany["Vertex Retail Group"]._id,
        title: "Tool consolidation project — Vertex Retail",
        source: "Referral",
        status: "Qualified",
        value: 950000,
        aiScore: 88,
        aiSummary: "Budget already approved and timeline is clear — this is a near-term close. Recommend fast-tracking the proposal.",
        description: "Replacing 3 existing tools. Q3 budget already allocated.",
      },
      {
        contact: byCompany["Zenith Industrial Corp"]._id,
        title: "Small team CRM rollout — Zenith Industrial",
        source: "Website",
        status: "New",
        value: 120000,
        aiScore: 41,
        aiSummary: "Price sensitivity may limit deal size. Consider offering the monthly plan to reduce friction and secure a quick win.",
        description: "8-person sales team, wants monthly billing.",
      },
      {
        contact: byCompany["CloudNine HR Solutions"]._id,
        title: "Startup plan upgrade — CloudNine HR",
        source: "Website",
        status: "Converted",
        value: 210000,
        aiScore: 95,
        aiSummary: "Champion internally advocating for the product — extremely low churn risk. Great candidate for a case study.",
        description: "Founder is a strong internal champion, already onboarding the team.",
      },
      {
        contact: byCompany["Pacific Wave Energy"]._id,
        title: "Procurement evaluation — Pacific Wave Energy",
        source: "LinkedIn",
        status: "Contacted",
        value: 2100000,
        aiScore: 55,
        aiSummary: "Large potential value but long formal procurement cycle expected. Keep nurturing with case studies while compliance docs are prepared.",
        description: "40-person org, formal RFP process, needs SOC 2 report.",
      },
      {
        contact: byCompany["Urban Stitch Apparel"]._id,
        title: "Customer insights dashboard — Urban Stitch",
        source: "Instagram Ad",
        status: "New",
        value: 85000,
        aiScore: null,
        aiSummary: "",
        description: "Currently tracking complaints via spreadsheets, wants a proper dashboard.",
      },
      {
        contact: byCompany["Nimbus Logistics"]._id,
        title: "Add-on seats — Nimbus regional managers",
        source: "Trade Show",
        status: "Lost",
        value: 60000,
        aiScore: 22,
        aiSummary: "Lost to internal budget freeze this quarter. Re-engage in Q4 when new budget cycle opens.",
        description: "Regional manager expansion paused due to internal budget freeze.",
      },
    ];
    const leads = await Lead.insertMany(leadsData.map((l) => ({ ...l, owner: user._id })));
    console.log(`   → ${leads.length} leads created`);

    // ---------- DEALS ----------
    const daysFromNow = (n) => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

    const dealsData = [
      { contact: byCompany["Vertex Retail Group"]._id, title: "Vertex Retail — Annual Enterprise Plan", stage: "Negotiation", amount: 950000, closeDate: daysFromNow(12), notes: "Final pricing call scheduled. Legal reviewing MSA." },
      { contact: byCompany["Nimbus Logistics"]._id, title: "Nimbus Logistics — Fleet Add-on", stage: "Proposal", amount: 480000, closeDate: daysFromNow(20), notes: "Proposal sent, awaiting internal sign-off from ops committee." },
      { contact: byCompany["CloudNine HR Solutions"]._id, title: "CloudNine HR — Startup Plan", stage: "Won", amount: 210000, closeDate: daysFromNow(-5), notes: "Closed won. Onboarding kickoff completed." },
      { contact: byCompany["BrightPath Finance"]._id, title: "BrightPath Finance — Enterprise Migration", stage: "Prospecting", amount: 1250000, closeDate: daysFromNow(45), notes: "Waiting on compliance documentation before next call." },
      { contact: byCompany["Pacific Wave Energy"]._id, title: "Pacific Wave Energy — Full Deployment", stage: "Prospecting", amount: 2100000, closeDate: daysFromNow(60), notes: "Formal RFP process in progress, SOC 2 report requested." },
      { contact: byCompany["Zenith Industrial Corp"]._id, title: "Zenith Industrial — Team Plan", stage: "Lost", amount: 120000, closeDate: daysFromNow(-10), notes: "Went with a cheaper competitor due to budget constraints." },
    ];
    const deals = await Deal.insertMany(dealsData.map((d) => ({ ...d, owner: user._id })));
    console.log(`   → ${deals.length} deals created`);

    // ---------- TASKS ----------
    const tasksData = [
      { title: "Send fleet-tracking demo invite to Priya Malhotra", description: "Include the regional managers she mentioned in CC.", dueDate: daysFromNow(2), priority: "High", completed: false, relatedLead: leads[0]._id },
      { title: "Prepare security whitepaper for BrightPath Finance", description: "Coordinate with the security team for RBI compliance section.", dueDate: daysFromNow(3), priority: "High", completed: false, relatedLead: leads[1]._id },
      { title: "Follow up on Vertex Retail MSA redlines", description: "Legal team flagged 2 clauses — confirm resolution with Sara.", dueDate: daysFromNow(1), priority: "High", completed: false, relatedDeal: deals[0]._id },
      { title: "Send onboarding checklist to CloudNine HR", description: "Kickoff call is done — share the 30-day onboarding plan.", dueDate: daysFromNow(-1), priority: "Medium", completed: true, relatedDeal: deals[2]._id },
      { title: "Check in with Karan Mehta on monthly billing option", description: "Confirm if monthly plan pricing works for Zenith's budget.", dueDate: daysFromNow(5), priority: "Medium", completed: false, relatedLead: leads[3]._id },
      { title: "Request SOC 2 report from compliance team", description: "Needed for Pacific Wave Energy's procurement process.", dueDate: daysFromNow(7), priority: "Medium", completed: false, relatedDeal: deals[4]._id },
      { title: "Draft case study questionnaire for CloudNine HR", description: "Founder agreed to be a reference customer.", dueDate: daysFromNow(10), priority: "Low", completed: false },
      { title: "Re-engage Nimbus Logistics regional add-on in Q4", description: "Budget freeze should lift after Q3 — set a reminder.", dueDate: daysFromNow(30), priority: "Low", completed: false, relatedLead: leads[7]._id },
    ];
    await Task.insertMany(tasksData.map((t) => ({ ...t, owner: user._id })));
    console.log(`   → ${tasksData.length} tasks created`);

    // ---------- INVOICES ----------
    const invoicesData = [
      {
        contact: byCompany["CloudNine HR Solutions"]._id,
        deal: deals[2]._id,
        invoiceNumber: "INV-0001",
        items: [
          { description: "CRM Pro — Startup Plan (Annual)", quantity: 1, price: 180000 },
          { description: "Onboarding & Setup", quantity: 1, price: 30000 },
        ],
        taxRate: 18,
        discount: 0,
        status: "Paid",
        issueDate: daysFromNow(-30),
        dueDate: daysFromNow(-15),
        notes: "Paid via bank transfer. Thank you!",
      },
      {
        contact: byCompany["Vertex Retail Group"]._id,
        deal: deals[0]._id,
        invoiceNumber: "INV-0002",
        items: [
          { description: "CRM Pro — Enterprise Plan (Annual)", quantity: 1, price: 850000 },
          { description: "Data Migration Service", quantity: 1, price: 100000 },
        ],
        taxRate: 18,
        discount: 20000,
        status: "Sent",
        issueDate: daysFromNow(-3),
        dueDate: daysFromNow(27),
        notes: "Awaiting payment as per agreed 30-day terms.",
      },
      {
        contact: byCompany["Nimbus Logistics"]._id,
        deal: deals[1]._id,
        invoiceNumber: "INV-0003",
        items: [{ description: "Fleet Tracking Add-on — 6 Regional Hubs", quantity: 6, price: 65000 }],
        taxRate: 18,
        discount: 30000,
        status: "Overdue",
        issueDate: daysFromNow(-45),
        dueDate: daysFromNow(-15),
        notes: "Follow up required — payment overdue by 15 days.",
      },
      {
        contact: byCompany["Zenith Industrial Corp"]._id,
        invoiceNumber: "INV-0004",
        items: [{ description: "CRM Pro — Team Plan (Monthly)", quantity: 1, price: 12000 }],
        taxRate: 18,
        discount: 0,
        status: "Draft",
        issueDate: daysFromNow(0),
        dueDate: daysFromNow(15),
        notes: "Draft — pending confirmation from Zenith before sending.",
      },
    ];
    const invoices = await Invoice.insertMany(invoicesData.map((i) => ({ ...i, owner: user._id })));
    console.log(`   → ${invoices.length} invoices created`);

    // ---------- ACTIVITY LOG ----------
    const activitiesData = [
      { type: "Note", title: "New lead created: Fleet tracking add-on — Nimbus Logistics", description: "Status: Qualified · Value: $480000", lead: leads[0]._id, contact: byCompany["Nimbus Logistics"]._id, createdAt: daysFromNow(-14) },
      { type: "Call", title: "Discovery call with Priya Malhotra", description: "Discussed fleet tracking requirements across 6 regional hubs. Very positive response.", contact: byCompany["Nimbus Logistics"]._id, createdAt: daysFromNow(-13) },
      { type: "Status Change", title: 'Lead "Fleet tracking add-on — Nimbus Logistics" moved to Qualified', lead: leads[0]._id, contact: byCompany["Nimbus Logistics"]._id, createdAt: daysFromNow(-10) },
      { type: "Email", title: "Sent security whitepaper to Arjun Rao", description: "Shared RBI compliance documentation as requested.", contact: byCompany["BrightPath Finance"]._id, createdAt: daysFromNow(-8) },
      { type: "Deal", title: "New deal created: Vertex Retail — Annual Enterprise Plan", description: "Stage: Proposal · Amount: $950000", deal: deals[0]._id, contact: byCompany["Vertex Retail Group"]._id, createdAt: daysFromNow(-7) },
      { type: "Meeting", title: "Product walkthrough with Sara Thompson", description: "Demoed the AI lead scoring and dashboard features. Very well received.", contact: byCompany["Vertex Retail Group"]._id, createdAt: daysFromNow(-6) },
      { type: "Status Change", title: 'Deal "Vertex Retail — Annual Enterprise Plan" moved to Negotiation', deal: deals[0]._id, contact: byCompany["Vertex Retail Group"]._id, createdAt: daysFromNow(-4) },
      { type: "Invoice", title: "Invoice INV-0002 created", description: "Status: Sent · Total: $1,024,600", contact: byCompany["Vertex Retail Group"]._id, deal: deals[0]._id, createdAt: daysFromNow(-3) },
      { type: "Contact", title: "New contact added: Neha Kapoor", description: "Urban Stitch Apparel", contact: byCompany["Urban Stitch Apparel"]._id, createdAt: daysFromNow(-2) },
      { type: "Invoice", title: "Invoice INV-0001 marked as Paid", contact: byCompany["CloudNine HR Solutions"]._id, deal: deals[2]._id, createdAt: daysFromNow(-15) },
      { type: "Note", title: "Follow-up reminder set for Karan Mehta", description: "Wants to confirm monthly billing option before proceeding.", lead: leads[3]._id, contact: byCompany["Zenith Industrial Corp"]._id, createdAt: daysFromNow(-1) },
    ];
    await Activity.insertMany(activitiesData.map((a) => ({ ...a, owner: user._id })));
    console.log(`   → ${activitiesData.length} activity log entries created`);

    console.log("\n🎉 Demo data seeded successfully! Refresh your dashboard to see it.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
    process.exit(1);
  }
};

run();
