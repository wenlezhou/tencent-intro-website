# AI Capabilities and Limitations

**URL**: https://anthropic.skilljar.com/ai-capabilities-and-limitations

**时长**: 0.25 hours of video  
**证书**: Certificate of completion available

---

## About this course

Most people's first experience with a generative AI system is a mix of delight and confusion. It produces a polished summary of a dense report in seconds, then confidently invents a citation that doesn't exist. It follows a detailed instruction perfectly, then ignores a simple one in the very next message. Without a mental model of what's happening underneath, these moments feel random — and it's hard to know whether to trust the next output, or how to fix the last one.

This course gives learners that mental model. It's the companion to *AI Fluency: Framework & Foundations*: where that course teaches the human competencies (Delegation, Description, Discernment, Diligence), this one teaches the machine properties those competencies are responding to. The two are designed to be taken in either order, and together they form a complete picture of effective human-AI collaboration.

We organize the course around four properties that shape what an AI system can and can't do for you: **Next Token Prediction** (where AI answers come from), **Knowledge** (what the model actually knows, and why it can be confidently wrong), **Working Memory** (what it's paying attention to right now, and what falls off the edge), and **Steerability** (how much control your instructions really give you). Each property sits on a spectrum from capability to limitation, and each section pairs a short explanation with a hands-on exercise so you can feel where the edges are rather than just read about them.

The final section looks at what happens when these properties collide — because in real use, they always do. A long document pushes against working memory while also straying into knowledge the model doesn't have; a vague instruction tests steerability at the same moment next-token prediction is reaching for whatever sounds most plausible. We close with a practical diagnostic: how to look at an unexpected output, recognize which kind of unexpected it is, locate roughly where on the capability-to-limitation continuum your task landed, and respond with a targeted fix instead of a generic retry.

---

## Recommended Prerequisites

**None.** This course assumes no technical background and no prior experience with AI tools. If you've already completed AI Fluency: Framework & Foundations, you'll recognize where each property connects to the 4Ds — but it's not required.

---

## Who This Is For

Anyone who uses, or is about to start using, generative AI in their work or studies and wants to understand why it behaves the way it does. Educators, students, knowledge workers, and team leads will all find the same core model useful, because the properties it describes don't change across use cases.

---

## Course Sections

### 1. Getting Started
**3 lessons**

The word 'AI' covers a lot of ground. This section narrows it to the kind of system you'll actually be working with — large language models — and explains how two training stages, pretraining and fine-tuning, turn a raw text predictor into the helpful assistant you interact with. Along the way you'll meet the four-property framework that organizes the rest of the course.

**Preview Images**:
- Lesson 1 video thumbnail
- Lesson 2 screenshot
- Lesson 3 screenshot

### 2. Next Token Prediction
**2 lessons**

Every answer an AI gives is built one token at a time, by predicting what should come next. This section shows what that means in practice: why the model is excellent at well-worn paths like summarizing or reformatting, why it can produce things that sound true but aren't, and how to recognize when a task is pushing into territory where prediction alone isn't enough.

**Preview Images**:
- Lesson 4 video thumbnail
- Lesson 4 screenshot

### 3. Knowledge
**2 lessons**

A model knows what was in its training data — frequently, recently, and consistently. This section unpacks what that implies: it's strong on mainstream topics and popular languages, weaker on anything rare, recent, niche, or contested. You'll practice judging where a question sits on that spectrum, so you know when to trust the answer and when to bring your own sources.

**Preview Images**:
- Lesson 5 video thumbnail
- Lesson 5 screenshot

### 4. Working Memory
**2 lessons**

The context window is the model's working memory: everything it can pay attention to right now, and nothing else. This section covers what fits, what quietly falls off the edge, why attention isn't uniform across a long document, and why a fresh session doesn't remember the last one. You'll learn to size up a task against the window before you start, instead of discovering the limit mid-conversation.

**Preview Images**:
- Lesson 6 video thumbnail
- Lesson 6 screenshot

### 5. Steerability
**2 lessons**

Your instructions are how you steer — but not all instructions land equally. Short, concrete, verifiable asks ('respond as a table', 'under 100 words') work reliably; long reasoning chains, abstract requests, and demands for native precision are where steering starts to slip. This section helps you tell the difference and rewrite a wobbly instruction into one the model can actually follow.

**Preview Images**:
- Lesson 7 video thumbnail
- Lesson 7 screenshot

### 6. Putting It All Together and Next Steps
**2 lessons**

Real tasks rarely test one property at a time. A long contract review strains working memory while reaching past the model's knowledge; a vague creative brief tests steerability right where next-token prediction wants to fill in something plausible. This section shows you how the four properties collide, and gives you a diagnostic for any unexpected output: name which property is in play, place the task on its spectrum, and apply a targeted fix instead of just trying again.

**Preview Images**:
- Section 6 screenshots

---

## The Four Properties Framework

### 1. Next Token Prediction
**What it is**: The model predicts one token at a time based on training data patterns.

**Capabilities**:
- Excellent at well-worn paths (summarizing, reformatting)
- Fast and fluent text generation
- Good at common patterns and conventions

**Limitations**:
- Can produce plausible-sounding but incorrect information
- Struggles with truly novel or creative tasks
- No inherent understanding, just pattern matching

**Hands-on Exercise**: Experience where prediction works well and where it fails.

### 2. Knowledge
**What it is**: What the model learned during training (frozen at training time).

**Capabilities**:
- Strong on mainstream topics and popular languages
- Good recall of frequently-encountered information
- Consistent within its training distribution

**Limitations**:
- Weaker on rare, recent, niche, or contested topics
- Can be confidently wrong (hallucination)
- Knowledge has expiration date (training cutoff)

**Hands-on Exercise**: Judge where questions sit on the knowledge spectrum; practice knowing when to trust answers vs. bring your own sources.

### 3. Working Memory
**What it is**: The context window — everything the model can pay attention to right now.

**Capabilities**:
- Can hold substantial context (hundreds of thousands of tokens)
- Maintains coherence across long conversations
- Can reference earlier parts of the conversation

**Limitations**:
- Finite capacity — things fall off the edge
- Attention isn't uniform across long documents
- Fresh sessions don't remember previous ones

**Hands-on Exercise**: Size up tasks against the context window before starting; experience discovering limits mid-conversation.

### 4. Steerability
**What it is**: How much control your instructions give you over the model's outputs.

**Capabilities**:
- Short, concrete, verifiable instructions work reliably
- Can follow formats, constraints, and structured requests
- Responsive to clear examples and patterns

**Limitations**:
- Long reasoning chains are hard to follow
- Abstract requests lead to variable results
- Demands for native precision (exact counts, perfect recall) where steering slips

**Hands-on Exercise**: Tell the difference between reliable and unreliable instructions; rewrite wobbly instructions into ones the model can actually follow.

---

## Practical Diagnostic: When AI Gives Unexpected Output

When you get an unexpected output, follow this diagnostic:

1. **Name which property is in play**
   - Next token prediction? (Sounding plausible but incorrect)
   - Knowledge? (Confident but wrong about facts)
   - Working memory? (Lost track of earlier context)
   - Steerability? (Instruction wasn't followed)

2. **Place the task on its spectrum**
   - Where on the capability-to-limitation continuum did your task land?
   - Which property was pushed to its limit?

3. **Apply a targeted fix instead of a generic retry**
   - **Next token prediction issue** → Add examples, constrain the output format
   - **Knowledge issue** → Provide sources, use RAG, or acknowledge uncertainty
   - **Working memory issue** → Break task into smaller pieces, summarize progress
   - **Steerability issue** → Make instructions shorter, concrete, and verifiable

---

## How This Course Connects to AI Fluency: Framework & Foundations

| AI Fluency Course (4D Framework) | This Course (Four Properties) |
|----------------------------------|-----------------------------------|
| **Delegation** — When to delegate tasks to AI | **Next Token Prediction** — What AI can reliably do vs. where it fails |
| **Description** — Crafting effective prompts | **Steerability** — How much control instructions give you |
| **Discernment** — Evaluating AI outputs | **Knowledge** — Why AI can be confidently wrong |
| **Diligence** — Responsible AI use | **Working Memory** — What AI can pay attention to |

These two courses are designed to be taken in either order. Together, they form a complete picture of effective human-AI collaboration.

---

## Key Takeaways

1. **AI isn't magic** — it's next-token prediction trained on data
2. **Each property has a spectrum** from capability to limitation
3. **Real tasks collide multiple properties** — diagnostics help you identify which one needs fixing
4. **Targeted fixes beat generic retries** — understand the property, then apply the right fix
5. **Mental models matter** — understanding how AI works makes you a better collaborator

---

**Scraped on**: 2026-06-30
**Source**: https://anthropic.skilljar.com/ai-capabilities-and-limitations
