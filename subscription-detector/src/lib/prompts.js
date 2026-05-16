export function getPlatformHiddenFeePrompt(url, pageContent) {
  return `You are a consumer advocate analyzing a platform's pricing or subscription page for hidden fees and deceptive practices.

Analyze the following web page content from ${url} and identify any:
- Hidden or non-prominently disclosed fees (setup fees, processing fees, service fees, taxes added at checkout)
- Auto-renewal clauses that may be easy to miss
- Cancellation fees, penalties, or difficult cancellation processes
- Price increases after introductory/trial periods
- Features locked behind paid add-ons not obvious from the main price
- "Free" tiers with significant limitations that funnel users to paid plans
- International or foreign transaction fees
- Overage charges (data, usage, seats)
- Early termination fees
- Fine print charges buried in terms

For each finding, return a JSON object with exactly these fields:
- id: a unique string slug
- name: the fee or practice name (concise, e.g. "Auto-renewal Clause", "Cancellation Fee")
- icon: a single relevant emoji
- amount: stated or estimated dollar amount as a number (use 0 if amount is unclear)
- frequency: one of "weekly", "monthly", "annual", or "one-time"
- category: short label, one of "Auto-renewal", "Cancellation Fee", "Hidden Surcharge", "Price Increase", "Add-on Upsell", "Fine Print", "Other"
- recommendation: exactly "review" or "cancel" (review = concerning, cancel = clearly deceptive or avoidable)
- reason: one sentence explaining why this is flagged and what the user should watch out for

If there are NO hidden fees or deceptive practices, return an empty findings array.

Return ONLY a valid JSON object in this shape: { "findings": [ ...items ] }

Page content:
${pageContent.slice(0, 8000)}`;
}

export function getSubscriptionPrompt(statementText) {
  return `You are a financial analyst reviewing a bank statement. Analyze the following bank statement text and identify ALL recurring charges — weekly, monthly, or annual subscriptions.

For each recurring charge, return a JSON object with exactly these fields:
- id: a unique string slug (e.g. "netflix-monthly")
- name: merchant or service name
- icon: a single relevant emoji
- amount: the charge amount as a number (no currency symbol)
- frequency: one of "weekly", "monthly", "annual"
- category: a short category label (e.g. "Streaming", "Software", "Fitness", "News", "Food", "Cloud Storage", "Gaming", "Other")
- recommendation: exactly one of "cancel", "review", or "keep"
- reason: one sentence explaining the recommendation

Recommendation rules:
- "cancel" if: duplicate services (e.g. two streaming platforms with overlapping content), auto-renewed free trials, or services that appear unused based on low/infrequent charge history
- "review" if: high monthly cost relative to typical market price, multiple similar-category services, or amounts that vary irregularly
- "keep" if: clearly useful core utility (internet, phone, insurance), low cost, or single service in its category

Return ONLY a valid JSON array of these objects. No markdown, no code fences, no explanation — just the raw JSON array.

Bank statement text:
${statementText}`;
}

export function getHiddenFeePrompt(statementText) {
  return `You are a financial analyst reviewing a bank statement. Analyze the following bank statement text and identify non-subscription charges that appear suspicious, unexpected, or avoidable — such as bank fees, overdraft charges, foreign transaction fees, late fees, maintenance fees, or small unexplained charges.

For each such charge, return a JSON object with exactly these fields:
- id: a unique string slug (e.g. "overdraft-fee-jan")
- name: charge or fee name
- icon: a single relevant emoji
- amount: the charge amount as a number (no currency symbol)
- frequency: one of "weekly", "monthly", "annual", or "one-time"
- category: a short category label (e.g. "Bank Fee", "Overdraft", "Foreign Transaction", "Late Fee", "Mystery Charge", "Other")
- recommendation: exactly one of "cancel", "review", or "keep"
- reason: one sentence explaining why this charge is flagged
- isHidden: true

Return ONLY a valid JSON array of these objects. No markdown, no code fences, no explanation — just the raw JSON array.

Bank statement text:
${statementText}`;
}
