# Claude 杂项实用工具指南

来源目录: `/misc/`



---

## Prompt Caching

# Prompt caching with the Claude API

Prompt caching lets you store and reuse context within your prompts, reducing latency by >2x and costs by up to 90% for repetitive tasks.

There are two ways to enable prompt caching:

- **Automatic caching** (recommended): Add a single `cache_control` field at the top level of your request. The system automatically manages cache breakpoints for you.
- **Explicit cache breakpoints**: Place `cache_control` on individual content blocks for fine-grained control over exactly what gets cached.

This cookbook demonstrates both approaches, starting with the simpler automatic method.

## Setup

```python

%pip install --upgrade 'anthropic>=0.83.0' bs4 requests python-dotenv --quiet

```

```python

import time

import anthropic
import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

load_dotenv()
client = anthropic.Anthropic()
MODEL_NAME = "claude-sonnet-4-6"

# Unique prefix to ensure we don't hit a stale cache from a previous run
TIMESTAMP = int(time.time())

```

Let's fetch the full text of *Pride and Prejudice* (~187k tokens) to use as our large context.

```python

def fetch_article_content(url):
    response = requests.get(url, timeout=30)
    soup = BeautifulSoup(response.content, "html.parser")

    for script in soup(["script", "style"]):
        script.decompose()

    text = soup.get_text()
    lines = (line.strip() for line in text.splitlines())
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    text = "\n".join(chunk for chunk in chunks if chunk)

    return text


book_url = "https://www.gutenberg.org/cache/epub/1342/pg1342.txt"
book_content = fetch_article_content(book_url)

print(f"Fetched {len(book_content)} characters from the book.")
print("First 500 characters:")
print(book_content[:500])

```

We'll also define a small helper to print usage stats:

```python

def print_usage(response, elapsed):
    """Print token usage and timing for an API response."""
    usage = response.usage
    cache_create = getattr(usage, "cache_creation_input_tokens", 0)
    cache_read = getattr(usage, "cache_read_input_tokens", 0)

    print(f"  Time:                {elapsed:.2f}s")
    print(f"  Input tokens:        {usage.input_tokens}")
    print(f"  Output tokens:       {usage.output_tokens}")
    if cache_create:
        print(f"  Cache write tokens:  {cache_create}")
    if cache_read:
        print(f"  Cache read tokens:   {cache_read}")

```

---
## Example 1: Automatic caching (single turn)

Automatic caching is the easiest way to get started. Add `cache_control={"type": "ephemeral"}` at the **top level** of your `messages.create()` call and the system handles the rest — automatically placing the cache breakpoint on the last cacheable block.

We'll compare three scenarios:
1. **No caching** — baseline
2. **First cached call** — creates the cache entry (similar timing to baseline)
3. **Second cached call** — reads from cache (the big speedup)

### Baseline: no caching

```python

start = time.time()
baseline_response = client.messages.create(
    model=MODEL_NAME,
    max_tokens=300,
    messages=[
        {
            "role": "user",
            "content": str(TIMESTAMP)
            + "<book>"
            + book_content
            + "</book>"
            + "\n\nWhat is the title of this book? Only output the title.",
        }
    ],
)
baseline_time = time.time() - start

print(f"Response: {baseline_response.content[0].text}")
print_usage(baseline_response, baseline_time)

```

### First call with automatic caching (cache write)

The only change is the top-level `cache_control` parameter. The first call writes to the cache, so timing is similar to the baseline.

```python

start = time.time()
write_response = client.messages.create(
    model=MODEL_NAME,
    max_tokens=300,
    cache_control={"type": "ephemeral"},  # <-- one-line change
    messages=[
        {
            "role": "user",
            "content": str(TIMESTAMP)
            + "<book>"
            + book_content
            + "</book>"
            + "\n\nWhat is the title of this book? Only output the title.",
        }
    ],
)
write_time = time.time() - start

print(f"Response: {write_response.content[0].text}")
print_usage(write_response, write_time)

```

### Second call with automatic caching (cache hit)

Same request again. This time the cached prefix is reused, so you should see a significant speedup.

```python

start = time.time()
hit_response = client.messages.create(
    model=MODEL_NAME,
    max_tokens=300,
    cache_control={"type": "ephemeral"},
    messages=[
        {
            "role": "user",
            "content": str(TIMESTAMP)
            + "<book>"
            + book_content
            + "</book>"
            + "\n\nWhat is the title of this book? Only output the title.",
        }
    ],
)
hit_time = time.time() - start

print(f"Response: {hit_response.content[0].text}")
print_usage(hit_response, hit_time)

print("\n" + "=" * 50)
print("COMPARISON")
print("=" * 50)
print(f"No caching:     {baseline_time:.2f}s")
print(f"Cache write:    {write_time:.2f}s")
print(f"Cache hit:      {hit_time:.2f}s")
print(f"Speedup:        {baseline_time / hit_time:.1f}x")

```

---
## Example 2: Automatic caching in a multi-turn conversation

Automatic caching really shines in multi-turn conversations. The cache breakpoint **automatically moves forward** as the conversation grows — you don't need to manage any markers yourself.

| Request | Cache behavior |
|---------|----------------|
| Request 1 | System + User:A cached (write) |
| Request 2 | System + User:A read from cache; Asst:B + User:C written to cache |
| Request 3 | System through User:C read from cache; Asst:D + User:E written to cache |

```python

system_message = f"{TIMESTAMP} <file_contents> {book_content} </file_contents>"

questions = [
    "What is the title of this novel?",
    "Who are Mr. and Mrs. Bennet?",
    "What is Netherfield Park?",
    "What is the main theme of this novel?",
]

conversation = []

for i, question in enumerate(questions, 1):
    print(f"\n{'=' * 50}")
    print(f"Turn {i}: {question}")
    print("=" * 50)

    conversation.append({"role": "user", "content": question})

    start = time.time()
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=300,
        cache_control={"type": "ephemeral"},  # automatic caching
        system=system_message,
        messages=conversation,
    )
    elapsed = time.time() - start

    assistant_reply = response.content[0].text
    conversation.append({"role": "assistant", "content": assistant_reply})

    print(f"\nAssistant: {assistant_reply[:200]}{'...' if len(assistant_reply) > 200 else ''}")
    print()
    print_usage(response, elapsed)

```

After the first turn, nearly 100% of input tokens are read from cache on every subsequent turn. The conversation code is just a plain list of messages — no special `cache_control` markers needed on individual blocks.

---
## Example 3: Explicit cache breakpoints

For more control, you can place `cache_control` directly on individual content blocks. This is useful when:

- You want to cache different sections with different TTLs
- You need to cache a system prompt independently from message content
- You want fine-grained control over what gets cached

You can also combine both approaches: use explicit breakpoints for your system prompt while automatic caching handles the conversation.

Below, we place `cache_control` directly on the book content block and manually move the breakpoint forward on each turn.

```python

class ConversationWithExplicitCaching:
    """Multi-turn conversation that manually places cache_control on the last user message."""

    def __init__(self):
        self.turns = []

    def add_user(self, content):
        self.turns.append({"role": "user", "content": [{"type": "text", "text": content}]})

    def add_assistant(self, content):
        self.turns.append({"role": "assistant", "content": [{"type": "text", "text": content}]})

    def get_messages(self):
        """Return messages with cache_control on the last user message."""
        result = []
        last_user_idx = max(i for i, t in enumerate(self.turns) if t["role"] == "user")

        for i, turn in enumerate(self.turns):
            if i == last_user_idx:
                result.append(
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "text",
                                "text": turn["content"][0]["text"],
                                "cache_control": {"type": "ephemeral"},
                            }
                        ],
                    }
                )
            else:
                result.append(turn)

        return result


conv = ConversationWithExplicitCaching()

for i, question in enumerate(questions, 1):
    print(f"\n{'=' * 50}")
    print(f"Turn {i}: {question}")
    print("=" * 50)

    conv.add_user(question)

    start = time.time()
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=300,
        system=[
            {
                "type": "text",
                "text": system_message,
                "cache_control": {"type": "ephemeral"},  # explicit breakpoint on system
            },
        ],
        messages=conv.get_messages(),
    )
    elapsed = time.time() - start

    assistant_reply = response.content[0].text
    conv.add_assistant(assistant_reply)

    print(f"\nAssistant: {assistant_reply[:200]}{'...' if len(assistant_reply) > 200 else ''}")
    print()
    print_usage(response, elapsed)

```

---
## Choosing an approach

| | Automatic caching | Explicit breakpoints |
|---|---|---|
| **Ease of use** | One-line change | Must place and move `cache_control` markers |
| **Multi-turn** | Breakpoint moves forward automatically | You manage breakpoint placement |
| **Fine-grained control** | No | Up to 4 independent breakpoints |
| **Mixed TTLs** | Single TTL for auto breakpoint | Different TTLs per breakpoint |
| **Combinable** | Yes — automatic + explicit together | Yes |

**Start with automatic caching.** It covers the majority of use cases with minimal effort. Switch to explicit breakpoints only when you need fine-grained control.

### Key details

- **Minimum cacheable length:** 1,024 tokens for Sonnet; 4,096 tokens for Opus and Haiku 4.5
- **Cache TTL:** 5 minutes by default (refreshed on each hit). A 1-hour TTL is available at 2x base input price.
- **Pricing:** Cache writes cost 1.25x base input price. Cache reads cost 0.1x base input price.
- **Breakpoint limit:** Up to 4 explicit breakpoints per request. Automatic caching uses one slot.

For full details, see the [prompt caching documentation](https://docs.anthropic.com/en/docs/build-with-claude/prompt-caching).



---

## Batch Processing

# Batch Processing with Message Batches API

Message Batches allow you to process large volumes of Messages requests asynchronously and cost-effectively. This cookbook demonstrates how to use the Message Batches API to handle bulk operations while reducing costs by 50%.

In this cookbook, we will demonstrate how to:

1. Create and submit message batches
2. Monitor batch processing status
3. Retrieve and handle batch results
4. Implement best practices for effective batching

## Setup

First, let's set up our environment with the necessary imports:

```python

%pip install anthropic

```

```python

import time

import anthropic

client = anthropic.Anthropic()
MODEL_NAME = "claude-sonnet-4-6"

```

## Example 1: Basic Batch Processing

Let's start with a simple example that demonstrates creating and monitoring a batch of message requests.

```python

# Prepare a list of questions for batch processing
questions = [
    "How do solar panels convert sunlight into electricity?",
    "What's the difference between mutual funds and ETFs?",
    "What is a pick and roll in basketball?",
    "Why do leaves change color in autumn?",
]

# Create batch requests
batch_requests = [
    {
        "custom_id": f"question-{i}",
        "params": {
            "model": MODEL_NAME,
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": question}],
        },
    }
    for i, question in enumerate(questions)
]

# Submit the batch
response = client.beta.messages.batches.create(requests=batch_requests)

print(f"Batch ID: {response.id}")
print(f"Status: {response.processing_status}")
print(f"Created at: {response.created_at}")

```

# Monitoring Batch Progress

Now let's monitor the batch processing status:

```python

def monitor_batch(batch_id, polling_interval=5):
    while True:
        batch_update = client.beta.messages.batches.retrieve(batch_id)
        batch_update_status = batch_update.processing_status
        print(batch_update)
        print(f"Status: {batch_update_status}")
        if batch_update_status == "ended":
            return batch_update

        time.sleep(polling_interval)


# Monitor our batch
batch_result = monitor_batch(response.id)
print("\nBatch processing complete!")
print("\nRequest counts:")
print(f"  Succeeded: {batch_result.request_counts.succeeded}")
print(f"  Errored: {batch_result.request_counts.errored}")
print(f"  Processing: {batch_result.request_counts.processing}")
print(f"  Canceled: {batch_result.request_counts.canceled}")
print(f"  Expired: {batch_result.request_counts.expired}")

```

# Retrieving Results

Once the batch is complete, we can retrieve and process the results:

```python

def process_results(batch_id):
    # First get the batch status
    batch = client.beta.messages.batches.retrieve(batch_id)

    print(f"\nBatch {batch.id} Summary:")
    print(f"Status: {batch.processing_status}")
    print(f"Created: {batch.created_at}")
    print(f"Ended: {batch.ended_at}")
    print(f"Expires: {batch.expires_at}")

    if batch.processing_status == "ended":
        print("\nIndividual Results:")
        for result in client.beta.messages.batches.results(batch_id):
            print(f"\nResult for {result.custom_id}:")
            print(f"Status: {result.result.type}")

            if result.result.type == "succeeded":
                print(f"Content: {result.result.message.content[0].text[:200]}...")
            elif result.result.type == "errored":
                print("Request errored")
            elif result.result.type == "canceled":
                print("Request was canceled")
            elif result.result.type == "expired":
                print("Request expired")


# Example usage:
batch_status = monitor_batch(response.id)
if batch_status.processing_status == "ended":
    process_results(batch_status.id)

```

## Example 2: Advanced Batch Processing for Different Message Types

This example demonstrates more advanced usage, including error handling and processing different types of requests in a single batch including a simple message, a message with a system prompt, a multi-turn message, and a message with an image.

```python

import base64


def create_complex_batch():
    # Get base64 encoded image
    def get_base64_encoded_image(image_path):
        with open(image_path, "rb") as image_file:
            binary_data = image_file.read()
            base_64_encoded_data = base64.b64encode(binary_data)
            base64_string = base_64_encoded_data.decode("utf-8")
            return base64_string

    # Mix of different request types
    batch_requests = [
        {
            "custom_id": "simple-question",
            "params": {
                "model": MODEL_NAME,
                "max_tokens": 1024,
                "messages": [{"role": "user", "content": "What is quantum computing?"}],
            },
        },
        {
            "custom_id": "image-analysis",
            "params": {
                "model": MODEL_NAME,
                "max_tokens": 1024,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": "image/jpeg",
                                    "data": get_base64_encoded_image(
                                        "../images/sunset-dawn-nature-mountain-preview.jpg"
                                    ),
                                },
                            },
                            {
                                "type": "text",
                                "text": "Describe this mountain landscape. What time of day does it appear to be, and what weather conditions do you observe?",
                            },
                        ],
                    }
                ],
            },
        },
        {
            "custom_id": "system-prompt",
            "params": {
                "model": MODEL_NAME,
                "max_tokens": 1024,
                "system": "You are a helpful science teacher.",
                "messages": [{"role": "user", "content": "Explain gravity to a 5-year-old."}],
            },
        },
        {
            "custom_id": "multi-turn",
            "params": {
                "model": MODEL_NAME,
                "max_tokens": 1024,
                "messages": [
                    {"role": "user", "content": "What is DNA?"},
                    {
                        "role": "assistant",
                        "content": "DNA is like a blueprint for living things...",
                    },
                    {"role": "user", "content": "How is DNA copied?"},
                ],
            },
        },
    ]

    try:
        response = client.beta.messages.batches.create(requests=batch_requests)
        return response.id
    except Exception as e:
        print(f"Error creating batch: {e}")
        return None


complex_batch_id = create_complex_batch()
print(f"Complex batch ID: {complex_batch_id}")

```

Great now let's view the results of the batch:

```python

# Example usage:
batch_status = monitor_batch(complex_batch_id)
if batch_status.processing_status == "ended":
    process_results(batch_status.id)

```



---

## How To Enable Json Mode

# Prompting Claude for "JSON Mode"

Claude doesn't have a formal "JSON Mode" with constrained sampling. But not to worry -- you can still get reliable JSON from Claude! This recipe will show you how.

First, let's look at Claude's default behavior.

```python

%pip install anthropic

```

```python

import json
import re
from pprint import pprint

from anthropic import Anthropic

```

```python

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"

```

```python

message = (
    client.messages.create(
        model=MODEL_NAME,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Give me a JSON dict with names of famous athletes & their sports.",
            },
        ],
    )
    .content[0]
    .text
)
print(message)

```

Claude followed instructions and outputted a nice dictionary, which we can extract with code:

```python

def extract_json(response):
    json_start = response.index("{")
    json_end = response.rfind("}")
    return json.loads(response[json_start : json_end + 1])


extract_json(message)

```

But what if we want Claude to skip the preamble and go straight to the JSON? One simple way is to prefill Claude's response and include a "{" character.

```python

message = (
    client.messages.create(
        model=MODEL_NAME,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": "Give me a JSON dict with names of famous athletes & their sports.",
            },
            {"role": "assistant", "content": "Here is the JSON requested:\n{"},
        ],
    )
    .content[0]
    .text
)
print(message)

```

Now all we have to do is add back the "{" that we prefilled and we can extract the JSON.

```python

output_json = json.loads("{" + message[: message.rfind("}") + 1])
output_json

```

For very long and complicated prompts, which contain multiple JSON outputs so that a string search for "{" and "}" don't do the trick, you can also have Claude output each JSON item in specified tags for future extraction.

```python

message = (
    client.messages.create(
        model=MODEL_NAME,
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": """Give me a JSON dict with the names of 5 famous athletes & their sports.
Put this dictionary in <athlete_sports> tags.

Then, for each athlete, output an additional JSON dictionary. In each of these additional dictionaries:
- Include two keys: the athlete's first name and last name.
- For the values, list three words that start with the same letter as that name.
Put each of these additional dictionaries in separate <athlete_name> tags.""",
            },
            {"role": "assistant", "content": "Here is the JSON requested:"},
        ],
    )
    .content[0]
    .text
)
print(message)

```

Now, we can use an extraction regex to get all the dictionaries.

```python

import re


def extract_between_tags(tag: str, string: str, strip: bool = False) -> list[str]:
    ext_list = re.findall(f"<{tag}>(.+?)</{tag}>", string, re.DOTALL)
    if strip:
        ext_list = [e.strip() for e in ext_list]
    return ext_list


athlete_sports_dict = json.loads(extract_between_tags("athlete_sports", message)[0])
athlete_name_dicts = [json.loads(d) for d in extract_between_tags("athlete_name", message)]

```

```python

pprint(athlete_sports_dict)

```

```python

pprint(athlete_name_dicts, width=1)

```

So to recap:

- You can use string parsing to extract the text between "```json" and "```" to get the JSON.
- You can remove preambles *before* the JSON via a partial Assistant message. (However, this removes the possibility of having Claude do "Chain of Thought" for increased intelligence before beginning to output the JSON.)
- You can get rid of text that comes *after* the JSON by using a stop sequence.
- You can instruct Claude to output JSON in XML tags to make it easy to collect afterward for more complex prompts.



---

## Building Evals

# Building Evals
Optimizing Claude to give you the highest possible accuracy on a task is an empirical science, and a process of continuous improvement. Whether you are trying to know if a change to your prompt made the model perform better on a key metric, or whether you are trying to gauge if the model is good enough to launch into production, a good system for offline evaluation is critical to success.

In this recipe, we will walk through common patterns in building evaluations, and useful rules of thumb to follow when doing so.

## Parts of an Eval
Evals typically have four parts.
- An input prompt that is fed to the model. We will ask Claude to generate a completion based on this prompt. Often when we design our evals the input column will contain a set of variable inputs that get fed into a prompt template at test time.
- An output that comes from running the input prompt through the model we want to evaluate.
- A "golden answer" to which we compare the model output. The golden answer could be a mandatory exact match, or it could be an example of a perfect answer meant to give a grader a point of comparison to base their scoring on.
- A score, generated by one of the grading methods discussed below, that represents how the model did on the question.

## Eval Grading Methods
There are two things about evals that can be time consuming and expensive. The first is writing the questions and golden answers for the eval. The second is grading. Writing questions and golden answers can be quite time consuming if you do not have a dataset already available or a way to create one without manually generating questions (consider using Claude to generate your questions!), but has the benefit of typically being a one-time fixed cost. You write questions and golden answers, and very rarely have to re-write them. Grading on the other hand is a cost you will incur every time you re-run your eval, in perpetuity - and you will likely re-run your eval a lot. As a result, building evals that can be quickly and cheaply graded should be at the center of your design choices.

There are three common ways to grade evals.
- **Code-based grading:** This involves using standard code (mostly string matching and regular expressions) to grade the model's outputs. Common versions are checking for an exact match against an answer, or checking that a string contains some key phrase(s). This is by far the best grading method if you can design an eval that allows for it, as it is super fast and highly reliable. However, many evaluations do not allow for this style of grading.
- **Human grading:** A human looks at the model-generated answer, compares it to the golden answer, and assigns a score. This is the most capable grading method as it _can_ be used on almost any task, but it is also incredibly slow and expensive, particularly if you've built a large eval. You should mostly try to avoid designing evals that require human grading if you can help it.
- **Model-based grading:** It turns out that Claude is highly capable of grading itself, and can be used to grade a wide variety of tasks that might have historically required humans, such as analysis of tone in creative writing or accuracy in free-form question answering. You do this by writing a _grader prompt_ for Claude.

Let's walk through an example of each grading method.

### Code-based Grading
Here we will be grading an eval where we ask Claude to successfully identify how many legs something has. We want Claude to output just a number of legs, and we design the eval in a way that we can use an exact-match code-based grader.

```python

# Install and read in required packages, plus create an anthropic client.
%pip install anthropic

```

```python

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"

```

```python

# Define our input prompt template for the task.
def build_input_prompt(animal_statement):
    user_content = f"""You will be provided a statement about an animal and your job is to determine how many legs that animal has.

    Here is the animal statment.
    <animal_statement>{animal_statement}</animal_statment>

    How many legs does the animal have? Return just the number of legs as an integer and nothing else."""

    messages = [{"role": "user", "content": user_content}]
    return messages

```

```python

# Define our eval (in practice you might do this as a jsonl or csv file instead).
eval = [
    {"animal_statement": "The animal is a human.", "golden_answer": "2"},
    {"animal_statement": "The animal is a snake.", "golden_answer": "0"},
    {
        "animal_statement": "The fox lost a leg, but then magically grew back the leg he lost and a mysterious extra leg on top of that.",
        "golden_answer": "5",
    },
]

```

```python

# Get completions for each input.
# Define our get_completion function (including the stop sequence discussed above).
def get_completion(messages):
    response = client.messages.create(model=MODEL_NAME, max_tokens=5, messages=messages)
    return response.content[0].text


# Get completions for each question in the eval.
outputs = [get_completion(build_input_prompt(question["animal_statement"])) for question in eval]

# Let's take a quick look at our outputs
for output, question in zip(outputs, eval, strict=False):
    print(
        f"Animal Statement: {question['animal_statement']}\nGolden Answer: {question['golden_answer']}\nOutput: {output}\n"
    )

```

```python

# Check our completions against the golden answers.
# Define a grader function
def grade_completion(output, golden_answer):
    return output == golden_answer


# Run the grader function on our outputs and print the score.
grades = [
    grade_completion(output, question["golden_answer"])
    for output, question in zip(outputs, eval, strict=False)
]
print(f"Score: {sum(grades) / len(grades) * 100}%")

```

### Human grading
Now let's imagine that we are grading an eval where we've asked Claude a series of open ended questions, maybe for a general purpose chat assistant. Unfortunately, answers could be varied and this can not be graded with code. One way we can do this is with human grading.

```python

# Define our input prompt template for the task.
def build_input_prompt(question):
    user_content = f"""Please answer the following question:
    <question>{question}</question>"""

    messages = [{"role": "user", "content": user_content}]
    return messages

```

```python

# Define our eval. For this task, the best "golden answer" to give a human are instructions on what to look for in the model's output.
eval = [
    {
        "question": "Please design me a workout for today that features at least 50 reps of pulling leg exercises, at least 50 reps of pulling arm exercises, and ten minutes of core.",
        "golden_answer": "A correct answer should include a workout plan with 50 or more reps of pulling leg exercises (such as deadlifts, but not such as squats which are a pushing exercise), 50 or more reps of pulling arm exercises (such as rows, but not such as presses which are a pushing exercise), and ten minutes of core workouts. It can but does not have to include stretching or a dynamic warmup, but it cannot include any other meaningful exercises.",
    },
    {
        "question": "Send Jane an email asking her to meet me in front of the office at 9am to leave for the retreat.",
        "golden_answer": "A correct answer should decline to send the email since the assistant has no capabilities to send emails. It is okay to suggest a draft of the email, but not to attempt to send the email, call a function that sends the email, or ask for clarifying questions related to sending the email (such as which email address to send it to).",
    },
    {
        "question": "Who won the super bowl in 2024 and who did they beat?",  # Claude should get this wrong since it comes after its training cutoff.
        "golden_answer": "A correct answer states that the Kansas City Chiefs defeated the San Francisco 49ers.",
    },
]

```

```python

# Get completions for each input.
# Define our get_completion function (including the stop sequence discussed above).
def get_completion(messages):
    response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=messages)
    return response.content[0].text


# Get completions for each question in the eval.
outputs = [get_completion(build_input_prompt(question["question"])) for question in eval]

# Let's take a quick look at our outputs
for output, question in zip(outputs, eval, strict=False):
    print(
        f"Question: {question['question']}\nGolden Answer: {question['golden_answer']}\nOutput: {output}\n"
    )

```

Because we will need to have a human grade this question, from here you would evaluate the outputs against the golden answers yourself, or write the outputs and golden answers to a csv and hand them to another human grader.

### Model-based Grading
Having to manually grade the above eval every time is going to get very annoying very fast, especially if the eval is a more realistic size (dozens, hundreds, or even thousands of questions). Luckily, there's a better way! We can actually have Claude do the grading for us. Let's take a look at how to do that using the same eval and completions from above.

```python

# We start by defining a "grader prompt" template.
def build_grader_prompt(answer, rubric):
    user_content = f"""You will be provided an answer that an assistant gave to a question, and a rubric that instructs you on what makes the answer correct or incorrect.

    Here is the answer that the assistant gave to the question.
    <answer>{answer}</answer>

    Here is the rubric on what makes the answer correct or incorrect.
    <rubric>{rubric}</rubric>

    An answer is correct if it entirely meets the rubric criteria, and is otherwise incorrect. =
    First, think through whether the answer is correct or incorrect based on the rubric inside <thinking></thinking> tags. Then, output either 'correct' if the answer is correct or 'incorrect' if the answer is incorrect inside <correctness></correctness> tags."""

    messages = [{"role": "user", "content": user_content}]
    return messages


# Now we define the full grade_completion function.
import re


def grade_completion(output, golden_answer):
    messages = build_grader_prompt(output, golden_answer)
    completion = get_completion(messages)
    # Extract just the label from the completion (we don't care about the thinking)
    pattern = r"<correctness>(.*?)</correctness>"
    match = re.search(pattern, completion, re.DOTALL)
    if match:
        return match.group(1).strip()
    else:
        raise ValueError("Did not find <correctness></correctness> tags.")


# Run the grader function on our outputs and print the score.
grades = [
    grade_completion(output, question["golden_answer"])
    for output, question in zip(outputs, eval, strict=False)
]
print(f"Score: {grades.count('correct') / len(grades) * 100}%")

```

As you can see, the claude-based grader is able to correctly analyze and grade Claude's responses with a high level of accuracy, saving you precious time.

Now you know about different grading design patterns for evals, and are ready to start building your own. As you do, here are a few guiding pieces of wisdom to get you started.
- Make your evals specific to your task whenever possible, and try to have the distribution in your eval represent ~ the real life distribution of questions and question difficulties.
- The only way to know if a model-based grader can do a good job grading your task is to try. Try it out and read some samples to see if your task is a good candidate.
- Often all that lies between you and an automatable eval is clever design. Try to structure questions in a way that the grading can be automated, while still staying true to the task. Reformatting questions into multiple choice is a common tactic here.
- In general, your preference should be for higher volume and lower quality of questions over very low volume with high quality.



---

## Session Memory Compaction

# Session Memory Compaction

Long-running conversations with Claude can exceed context limits, causing loss of important information. Whether you're building a coding assistant, creative writing tool, or customer service agent, managing session memory is critical for maintaining continuity and quality.

This cookbook teaches you how to **proactively manage session memory** to avoid jarring context limit interruptions. Unlike reactive approaches that wait until the context is full, you'll learn to build session memory in the background so compaction is instant when needed.

**Related:** For automatic SDK-based compaction in agentic workflows, see [Automatic Context Compaction](../tool_use/automatic-context-compaction.ipynb). This cookbook focuses on manual control patterns for conversational applications.

## Learning Objectives

By the end of this cookbook, you will be able to:

- Write effective session memory prompts that preserve critical context across compaction events
- Implement **instant compaction** using background threading to eliminate user wait time
- Apply prompt caching to reduce the cost of background memory updates by ~80%
- Choose appropriate compaction strategies (traditional vs. instant) based on your use case

## Prerequisites and Setup

Before following this guide, ensure you have:

**Required Knowledge**
- Basic understanding of Claude API usage and message formatting
- Familiarity with Python threading concepts (helpful but not required)

**Required Tools**
- Python 3.11 or higher
- Anthropic API key
- Anthropic SDK

### Installation

First, install the required dependencies:

```python

%%capture
%pip install -U anthropic python-dotenv

```

```python

import anthropic
from anthropic.types import MessageParam, TextBlockParam
from dotenv import load_dotenv

load_dotenv()

client = anthropic.Anthropic()
MODEL = "claude-sonnet-4-6"

```

```python

# Helper functions
def truncate_response(text: str, max_lines: int = 15) -> str:
    """Truncate long responses for cleaner output display."""
    lines = text.strip().split("\n")
    if len(lines) <= max_lines:
        return text
    return "\n".join(lines[:max_lines]) + f"\n... ({len(lines) - max_lines} more lines)"


def remove_thinking_blocks(text: str) -> tuple[str, str]:
    """Remove <think>...</think> blocks from the text."""
    import re

    matches = re.findall(r"<think>.*?</think>", text, flags=re.DOTALL)
    cleaned = re.sub(r"<think>.*?</think>\s*", "", text, flags=re.DOTALL).strip()
    return cleaned, "".join(matches)


def add_cache_control(messages: list[dict]) -> list[MessageParam]:
    """Add cache_control to the last user message for prompt caching.

    For prompt caching to work, the message prefix structure must be identical between requests.
    All messages are converted to list format for consistency, and cache_control is placed on
    the last user message to match the standard API call pattern.
    """
    cached_messages: list[MessageParam] = []
    last_user_idx = None

    # Find last user message index
    for i, msg in enumerate(messages):
        if msg["role"] == "user":
            last_user_idx = i

    for i, msg in enumerate(messages):
        content = msg["content"]
        text = content if isinstance(content, str) else content[0]["text"]

        content_block: TextBlockParam = {"type": "text", "text": text}
        if i == last_user_idx:
            content_block["cache_control"] = {"type": "ephemeral"}

        cached_messages.append({"role": msg["role"], "content": [content_block]})

    return cached_messages


def estimate_tokens(text: str) -> int:
    """Rudimentary token estimation: 1 token per 4 characters."""
    return len(text) // 4

```

```python

SESSION_MEMORY_PROMPT = """
Compress the conversation into a structured summary
that preserves all information needed to continue work seamlessly. Optimize for the assistant's
ability to continue working, not human readability.

<analysis-instructions>
Before generating your summary, analyze the transcript in <think>...</think> tags:
1. What did the user originally request? (Exact phrasing)
2. What actions succeeded? What failed and why?
3. Did the user correct or redirect the assistant at any point?
4. What was actively being worked on at the end?
5. What tasks remain incomplete or pending?
6. What specific details (IDs, paths, values, names) must survive compression?
</analysis-instructions>

<summary-format>
## User Intent
The user's original request and any refinements. Use direct quotes for key requirements.
If the user's goal evolved during the conversation, capture that progression.

## Completed Work
Actions successfully performed. Be specific:
- What was created, modified, or deleted
- Exact identifiers (file paths, record IDs, URLs, names)
- Specific values, configurations, or settings applied

## Errors & Corrections
- Problems encountered and how they were resolved
- Approaches that failed (so they aren't retried)
- User corrections: "don't do X", "actually I meant Y", "that's wrong because..."
Capture corrections verbatim—these represent learned preferences.

## Active Work
What was in progress when the session ended. Include:
- The specific task being performed
- Direct quotes showing exactly where work left off
- Any partial results or intermediate state

## Pending Tasks
Remaining items the user requested that haven't been started.
Distinguish between "explicitly requested" and "implied/assumed."

## Key References
Important details needed to continue:
- Identifiers: IDs, paths, URLs, names, keys
- Values: numbers, dates, configurations, credentials (redacted)
- Context: relevant background information, constraints, preferences
- Citations: sources referenced during the conversation
</summary-format>

<preserve-rules>
Always preserve when present:
- Exact identifiers (IDs, paths, URLs, keys, names)
- Error messages verbatim
- User corrections and negative feedback
- Specific values, formulas, or configurations
- Technical constraints or requirements discovered
- The precise state of any in-progress work
</preserve-rules>

<compression-rules>
- Weight recent messages more heavily—the end of the transcript is the active context
- Omit pleasantries, acknowledgments, and filler ("Sure!", "Great question")
- Omit system context that will be re-injected separately
- Keep each section under 500 words; condense older content to make room for recent
- If you must cut details, preserve: user corrections > errors > active work > completed work
</compression-rules>
"""

```

### Code example using traditional compacting
In traditional compaction, you generate one summary once the token threshold is reached.
Traditional compaction is slow: when you hit the context limit, you wait for a summary.

```
TRADITIONAL COMPACTION (slow)
─────────────────────────────
Turn 1 → Turn 2 → Turn 3 → ... → Turn N → CONTEXT FULL!
                                              │
                                              ▼
                                    ┌─────────────────┐
                                    │ Generate summary│
                                    │ ( USER WAITS !) │
                                    └─────────────────┘
                                              │
                                              ▼
                                         Continue

```

```python

import time


class TraditionalCompactingChatSession:
    """Traditional chat session with compaction after the fact."""

    def __init__(self, system_message="You are a helpful assistant", context_limit: int = 10000):
        self.system_message = system_message
        self.context_limit = context_limit  # the point at which the conversation is compacted so it does not exceed model limits.
        self.messages = []
        self.current_context_window_tokens = 0
        self.summary = None

    def chat(self, user_message: str) -> tuple[str, anthropic.types.Usage]:
        # In traditional compaction, we check if we need to compact when the user sends a message. NOT IDEAL!
        if self.current_context_window_tokens >= self.context_limit:
            print(
                f"\n🧹 Context window at {self.current_context_window_tokens} tokens. Limit exceeded, compacting session memory..."
            )
            self.compact()  # compacts everything before the new user message

        self.messages.append({"role": "user", "content": user_message})
        print(f"\nUser: {user_message}")

        response = client.messages.create(
            model=MODEL,
            max_tokens=3500,
            system=self.system_message,
            messages=add_cache_control(self.messages),
        )
        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})

        print(f"\nAssistant: \n{truncate_response(assistant_message, max_lines=15)}")

        # approximate current token count in the conversation before the next user message
        cache_read = getattr(response.usage, "cache_read_input_tokens", 0) or 0
        total_input = response.usage.input_tokens + cache_read
        self.current_context_window_tokens = total_input + response.usage.output_tokens

        print(
            f"Input={total_input:,}, Prompt cached used= {cache_read > 0} | "
            f"Output={response.usage.output_tokens:,} | "
            f"Messages={len(self.messages)}"
        )
        return assistant_message, response.usage

    def compact(self) -> None:
        start_time = time.perf_counter()

        response = client.messages.create(
            model=MODEL,
            max_tokens=5000,
            system=self.system_message,  # Same as main chat for cache sharing
            messages=add_cache_control(self.messages)
            + [{"role": "user", "content": SESSION_MEMORY_PROMPT}],
        )
        elapsed = time.perf_counter() - start_time

        # Generate new summary message
        self.summary, removed_text = remove_thinking_blocks(
            response.content[0].text
        )  # clean up any <think> blocks because they are not needed in the session memory
        approximate_summary_tokens = response.usage.output_tokens - round(
            len(removed_text) / 4
        )  # rough estimate of tokens removed from summary

        # Replace prior messages with new summary message
        self.messages = [
            {
                "role": "user",
                "content": f"""This session is being continued from a previous conversation. Here is the session memory: {self.summary}.Continue from where we left off.""",
            }
        ]

        # Show token reduction if we just compacted
        reduction = self.current_context_window_tokens - approximate_summary_tokens
        pct = (reduction / self.current_context_window_tokens) * 100

        print(f"\n{'-' * 60}")
        print("📝 New session memory created.")
        print(
            f"✅ Tokens reduced: {self.current_context_window_tokens:,} → {approximate_summary_tokens:.0f} ({reduction:,} tokens saved, {pct:.0f}% reduction)"
        )
        print(f"⏱️ Compaction time: {elapsed:.2f}s (user waiting...)")
        print(f" Cache used: {getattr(response.usage, 'cache_read_input_tokens', 0) > 0}")
        print(f"{'-' * 60}")

        # Update token count to reflect compacted state
        self.current_context_window_tokens = approximate_summary_tokens

```

Below we simulate a conversation between an author and an LLM that helps write stories.

```python

SYSTEM_PROMPT = """
You are a short story writer who helps authors develop their ideas into compelling narratives.

## What You Do

**Plot Development**
- Help authors work through story structure, pacing, and narrative arc
- Identify plot holes, inconsistencies, or missed opportunities
- Suggest ways to raise stakes, add tension, or deepen conflict
- Brainstorm twists, resolutions, and scene transitions

**Character Development**
- Develop backstories, motivations, and internal conflicts
- Ensure characters have distinct voices and consistent behavior
- Explore character relationships and how they drive the plot
- Help authors understand what their characters want vs. what they need

**Drafting**
- Write short stories or scenes based on the author's ideas and direction
- Match tone, genre conventions, and stylistic preferences
- Show rather than tell when bringing scenes to life
- Craft dialogue that reveals character and advances plot

## How You Work
- You are the lead writer. When you disagree with a creative choice, say so respectfully, but ultimately defer to what the author wants.
- DO NOT ask the user to provide more context or clarify their request. Assume you have enough information to proceed.
"""

```

```python

session = TraditionalCompactingChatSession(system_message=SYSTEM_PROMPT)

# Simulated conversation
messages = [
    "I want to create a story about a young detective solving a mysterious case in a small town. Generate 3 well thought out plot ideas for me to consider.",
    "I don't like those ideas, can you think of one plot something more unique and unexpected?",
    "Ok I like it. Can you help me develop the main character's backstory and motivations?",
    "Can you draft a detailed outline for the story, breaking it down into chapters and key events?",
    "Can you draft me a first chapter based on the plot and character ideas we've discussed so far? Make it around 2,000 words.",
    "Can you draft a second chapter that builds on the first one, introducing a new twist in the mystery?",
]

print("Starting conversation...\n")

turn_count = 0

for _i, message in enumerate(messages, 1):
    turn_count += 1
    print(f"==============================================\nTurn {turn_count}:\n")
    response, usage = session.chat(message)

```

This is a long conversation with several turns. You'll notice a few things here:

Prompt caching: You'll notice here that the input tokens eventually grew to a point where prompt caching was used (turn 6). This helps reduce costs and speed as these conversations grow!

On the next turn, we are going to hit our 10K context window limit, which triggers compaction:

```python

response, usage = session.chat("Propose a title for the book")

```

You'll notice here that it took **over 40 seconds** for the agent to compact the conversation. Because we used traditional compaction, the user would be waiting on Claude to compact the conversation, which is not an ideal user experience.

Below you can see the result of the compaction. It captures the key elements of conversation in less than 2K tokens.

```python

print(session.summary)

```

## Instant Compaction

With **Instant compaction** the session memory is PROACTIVELY generated once a soft token threshold is reached. 

Once the user triggers a compaction or a hard limit is reached, the summary is already available, so the user doesn't need to wait.

Result: Instant compaction, no waiting.

SESSION MEMORY COMPACTION (instant)
```
────────────────────────────────────
Turn 1 → Turn 2 → ... → Turn K → Turn K+1 → ... → Turn N → ..  → CONTEXT FULL!
                            │                         │            │
                (soft token threshold met:        (update          │
               initialize session memory)          trigger)        │
                            │                                      │
                            │                         │            │
                            ▼                         ▼            │
                       ┌────────┐                ┌────────┐        │
                       │ Create │                │ Update │        │
                       │ memory │ (background)   │ memory │        │
                       └────────┘                └────────┘        │
                            │                         │            │
                            ▼                         ▼            ▼
                     📝 session-memory.md ──────────────────► INSTANT SWAP!
                       (continuously updated)
```

**Update triggers:** The first summary is generated after the initial soft token limit. Updates can be triggered after every subsequent turn, or at periodically at natural breakpoints intervals (e.g. every ~10k tokens or 3+ tool calls).

This `InstantCompactingChatSession` class uses **threading** for background execution:
1. **`threading.Thread`** - runs memory updates in background without blocking
2. **Thread-safe state** - uses `threading.Lock` to safely update shared memory
3. **Daemon threads** - background work doesn't prevent program exit
4. **Instant compaction** - when context is full, just swap in the pre-built memory

```python

import threading
import time


class InstantCompactingChatSession:
    """
    Maintains session memory via incremental background updates.

    Key insight: By updating memory in the background after each turn,
    the summary is already ready when compaction is needed - instant swap!
    """

    def __init__(
        self,
        system_message="You are a helpful assistant",
        context_limit: int = 12000,
        min_tokens_to_init: int = 7500,
        min_tokens_between_updates: int = 2000,
    ):
        # Thresholds
        self.context_limit = context_limit  # the point at which the conversation is compacted so it does not exceed model limits
        self.min_tokens_to_init = min_tokens_to_init  # tokens needed to trigger initial memory creation; note this happens PROACTIVELY in background unlike traditional compaction
        self.min_tokens_between_updates = min_tokens_between_updates  # tokens needed to trigger memory update. only comes into play after initial memory is created and additional compaction (memory update) is needed after that

        # Conversation state
        self.system_message = system_message
        self.messages = []
        self.current_context_window_tokens = 0

        # Session memory state
        self.session_memory = None  # this is the compacted conversation in session memory; for the demo we are storing this in memory, but in production you would write to session_memory.md file
        self.last_summarized_index = (
            0  # The index of the last message included in the session memory
        )
        self.tokens_at_last_update = 0  # To track tokens at last memory update and see if enough new tokens have been added to trigger another update

        # Background update tracking
        self._update_thread: threading.Thread | None = None
        self.last_update_time = None
        self._lock = threading.Lock()

    def chat(self, user_message: str) -> tuple[str, anthropic.types.Usage, str | None]:
        """Process a chat turn with background session memory updates."""

        if self.current_context_window_tokens + estimate_tokens(user_message) >= self.context_limit:
            self.compact()  # note that when this is triggered, the compaction has already been created and is just swapped in instantly

        self.messages.append({"role": "user", "content": user_message})

        response = client.messages.create(
            model=MODEL,
            max_tokens=3500,
            system=self.system_message,
            messages=add_cache_control(self.messages),
        )

        assistant_message = response.content[0].text
        self.messages.append({"role": "assistant", "content": assistant_message})

        # Calculate token usage including cache
        cache_read = getattr(response.usage, "cache_read_input_tokens", 0) or 0
        total_input = response.usage.input_tokens + cache_read

        # Update context window tokens (includes cached tokens since they still count toward context)
        self.current_context_window_tokens = total_input + response.usage.output_tokens

        # KEY DIFFERENCE: Trigger background memory update if needed proactively, before compaction is needed
        background_status = None
        if self._should_init_memory() or self._should_update_memory():
            self._trigger_background_update()
            background_status = "initializing" if self.session_memory is None else "updating"

        # Return usage info with cache stats
        return assistant_message, response.usage, background_status

    # Helper methods to determine when to init session memory
    def _should_init_memory(self) -> bool:
        return (
            self.session_memory is None
            and self.current_context_window_tokens >= self.min_tokens_to_init
        )

    # Helper method to determine if memory should be updated
    def _should_update_memory(self) -> bool:
        if self.session_memory is None:
            return False
        tokens_since = self.current_context_window_tokens - self.tokens_at_last_update
        return tokens_since >= self.min_tokens_between_updates

    # Methods to create initial session memory
    def _create_session_memory(self, messages: list[dict]) -> str:
        """Generate initial session memory from messages."""
        # Put compaction instructions in user message to share cache with main chat
        compaction_messages = [{"role": "user", "content": SESSION_MEMORY_PROMPT}]
        response = client.messages.create(
            model=MODEL,
            max_tokens=5000,
            system=self.system_message,  # Same as main chat for cache sharing
            messages=add_cache_control(messages) + compaction_messages,
        )
        summary, _ = remove_thinking_blocks(
            response.content[0].text
        )  # clean up any <think> blocks because they are not needed in the session memory
        print(
            f"   [Background] Initial session memory created. Cache hit={getattr(response.usage, 'cache_read_input_tokens', 0) > 0}"
        )
        return summary

    def _update_session_memory(self, new_messages: list[dict]) -> str:
        """Update existing session memory with new messages. In practice, you may want to do this via file edit rather than full re-generation. But for demo purposes we do full regeneration here."""
        # Put compaction instructions in user message to share cache with main chat
        compaction_update_messages = [
            {
                "role": "user",
                "content": SESSION_MEMORY_PROMPT
                + f"""There is an existing session memory: {self.session_memory}. Return the entire session memory with updates to reflect new messages.""",
            }
        ]
        response = client.messages.create(
            model=MODEL,
            max_tokens=5000,
            system=self.system_message,
            messages=new_messages
            + compaction_update_messages,  # you may want to use prompt caching instead, in which case you'd use add_cache_control(self.messages) here
        )
        updated_summary, _ = remove_thinking_blocks(
            response.content[0].text
        )  # clean up any <think> blocks because they are not needed in the session memory
        print("   [Background] Session memory updated.")
        return updated_summary

    # Background memory update methods
    def _background_memory_update(
        self, messages_snapshot: list[dict], snapshot_index: int, current_tokens: int
    ) -> None:
        """Run session memory update in a background thread."""
        try:
            with self._lock:
                current_session_memory = self.session_memory
                last_index = self.last_summarized_index

            if current_session_memory is None:
                new_memory = self._create_session_memory(messages_snapshot)
            else:
                # Get new messages since last summary
                new_messages = messages_snapshot[last_index:]
                if not new_messages:
                    return
                new_memory = self._update_session_memory(new_messages)

            # Update state (thread-safe)
            with self._lock:
                self.session_memory = new_memory
                self.last_summarized_index = snapshot_index
                self.tokens_at_last_update = current_tokens
                self.last_update_time = time.time()

        except Exception as e:
            print(f"   [Background] Error updating memory: {e}")

    # This makes sure only one background update runs at a time. If one is already running, we skip starting another. If not, we start a new thread to do the update.
    def _trigger_background_update(self):
        """Trigger a background session memory update."""
        if self._update_thread is not None and self._update_thread.is_alive():
            return

        messages_snapshot = self.messages.copy()
        snapshot_index = len(messages_snapshot)
        current_tokens = self.current_context_window_tokens

        self._update_thread = threading.Thread(
            target=self._background_memory_update,
            args=(messages_snapshot, snapshot_index, current_tokens),
            daemon=True,
        )
        self._update_thread.start()

    # Function to compact
    def compact(self) -> None:
        """INSTANT compaction using pre-built session memory."""
        prev_msg_count = len(self.messages)

        # Ensure session memory is ready. Shouldn't be an issue normally, but here for safety.
        if self.session_memory is None:
            if self._update_thread is not None and self._update_thread.is_alive():
                print("   ⏳ Waiting for background memory update...")
                self._update_thread.join(timeout=30.0)

            if self.session_memory is None:
                print("   ⚠️  No pre-built memory, creating synchronously...")
                start = time.perf_counter()
                self.session_memory = self._create_session_memory(self.messages)
                elapsed = time.perf_counter() - start
                print(f"   ⏱️  Took {elapsed:.2f}s (but should be instant normally!)")
                self.last_summarized_index = len(self.messages)

        with self._lock:
            unsummarized = self.messages[self.last_summarized_index :]
            summary_message = [
                {
                    "role": "user",
                    "content": f"""This session is being continued from a previous conversation. Here is the session memory: {self.session_memory}.Continue from where we left off.""",
                }
            ]
            self.messages = summary_message + unsummarized
            self.last_summarized_index = 1

            print(f"\n{'=' * 60}")
            print(f"⚡ INSTANT COMPACTION! Messages: {prev_msg_count} → {len(self.messages)}")
            print("   Session memory was pre-built (no wait time!)")
            print(f"{'=' * 60}")

```

### Example use of Instant Compaction

```python

# Low thresholds for demo - in production you'd use higher values
session = InstantCompactingChatSession(
    system_message=SYSTEM_PROMPT,
)

messages = [
    "I want to create a story about a young detective solving a mysterious case in a small town. Generate 3 well thought out plot ideas for me to consider.",
    "I don't like those ideas, can you think of one plot something more unique and unexpected?",
    "Ok I like it. Can you help me develop the main character's backstory and motivations?",
    "Can you draft a detailed outline for the story, breaking it down into chapters and key events?",
    "Can you draft me a first chapter based on the plot and character ideas we've discussed so far? Make it around 2,000 words.",
    "Can you draft a second chapter that builds on the first one?",
]
print("Starting conversation with instant compacting chat session...\n")

turn_count = 0
for message in messages:
    response, usage, background_status = session.chat(message)
    turn_count += 1

    # Calculate cache stats
    cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
    cache_created = getattr(usage, "cache_creation_input_tokens", 0) or 0
    total_input = usage.input_tokens + cache_read

    print(f"{'=' * 60}")
    print(f"Turn {turn_count}:")
    print(f"\nUser: {message}")
    print(f"\nAssistant: \n{truncate_response(response, max_lines=3)}")
    print("\nToken Usage:")
    print(f"  Input: {total_input:,} (new: {usage.input_tokens:,}, cached: {cache_read:,})")
    print(f"  Output: {usage.output_tokens:,}")
    print(
        f"  Messages: {len(session.messages)} | Memory: {'ready' if session.session_memory else 'not yet'}"
    )

    if cache_read > 0:
        cache_pct = (cache_read / total_input) * 100
        print(f"  ✓ Cache hit! {cache_pct:.0f}% of input from cache")

    if background_status:
        print(f"\n  [Background] Proactively {background_status} session memory...")
        print(f"  Context window: {session.current_context_window_tokens:,} tokens")

    print()

```

```python

message = "What did we just talk about? Give me one sentence"
response, usage, background_status = session.chat(message)

# Calculate cache stats
cache_read = getattr(usage, "cache_read_input_tokens", 0) or 0
total_input = usage.input_tokens + cache_read

print(f"\nUser: {message}")
print(f"\nAssistant: \n{truncate_response(response, max_lines=3)}")
print("\nToken Usage:")
print(f"  Input: {total_input:,} (new: {usage.input_tokens:,}, cached: {cache_read:,})")
print(f"  Output: {usage.output_tokens:,}")
print(
    f"  Messages: {len(session.messages)} | Memory: {'ready' if session.session_memory else 'not yet'}"
)

if cache_read > 0:
    cache_pct = (cache_read / total_input) * 100
    print(f"  ✓ Cache hit! {cache_pct:.0f}% of input from cache")

```

You'll notice here that once we hit the context limit, the session memory was instantaly swapped in, meaning the user had zero waiting time for a response!

## Advanced: Understanding Prompt Caching

The background updates can be made **~10x cheaper** by using prompt caching. The trick:
1. Pass the **full conversation** to the background summarizer
2. Add `cache_control` markers so subsequent requests hit the cache
3. Only the new "summarize this" instruction is billed at full price

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                    PROMPT CACHING FOR LONG CONVERSATIONS                        │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  WITHOUT CACHING: Pay full price for entire context every turn                 │
│  ════════════════════════════════════════════════════════════                   │
│                                                                                 │
│  Turn 1:  [System][User1][Asst1]                         →  500 tokens  @ $3/M │
│  Turn 2:  [System][User1][Asst1][User2][Asst2]           → 1500 tokens  @ $3/M │
│  Turn 3:  [System][User1][Asst1][User2][Asst2][User3]... → 3000 tokens  @ $3/M │
│  Turn 4:  [System][User1][Asst1][User2][Asst2][User3]... → 5000 tokens  @ $3/M │
│           ─────────────────────────────────────────────                         │
│                                              Total: 10,000 tokens = $0.030      │
│                                                                                 │
│                                                                                 │
│  WITH CACHING: Pay full price once, then 90% discount on prefix                │
│  ═══════════════════════════════════════════════════════════════                │
│                                                                                 │
│  Turn 1:  [System][User1][Asst1]◆                        →  500 tokens  @ $3/M │
│                                ▲                            (cache created)    │
│                          cache breakpoint                                       │
│                                                                                 │
│  Turn 2:  [System][User1][Asst1][User2][Asst2]◆                                │
│           ╰─────── cached ──────╯                                              │
│                500 @ $0.30/M + 1000 new @ $3/M  =  $0.0032                     │
│                                                                                 │
│  Turn 3:  [System][User1][Asst1][User2][Asst2][User3][Asst3]◆                  │
│           ╰──────────── cached ─────────────╯                                  │
│               1500 @ $0.30/M + 1500 new @ $3/M  =  $0.0050                     │
│                                                                                 │
│  Turn 4:  [System][User1][Asst1][User2][Asst2][User3][Asst3][User4][Asst4]◆    │
│           ╰───────────────────── cached ─────────────────────╯                 │
│                     3000 @ $0.30/M + 2000 new @ $3/M  =  $0.0069               │
│           ─────────────────────────────────────────────                         │
│                                              Total: $0.0166  (45% savings)     │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  COMPACTION + CACHING: Double benefit                                           │
│  ════════════════════════════════════                                           │
│                                                                                 │
│    Main Chat                      Background Summarizer                         │
│    ─────────                      ─────────────────────                         │
│                                                                                 │
│  [Conversation grows...]          [Same conversation prefix]◆ + [Summarize!]   │
│         │                                    │                                  │
│         │                         Cache hit! Only pays for                      │
│         │                         the summarization prompt                      │
│         │                                    │                                  │
│         ▼                                    ▼                                  │
│  Context limit reached  ──────►  Session memory ready instantly                │
│                                  (built cheaply in background)                  │
│                                                                                 │
│  ┌──────────────────────────────────────────────────────────────────────────┐  │
│  │  Key insight: The background summarizer reuses the same conversation     │  │
│  │  prefix that was just sent to the main chat - automatic cache hit!       │  │
│  └──────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘

◆ = cache_control breakpoint (cache everything before this point)
```

### Why this matters for compaction

| Scenario | Cost per background update | Notes |
|----------|---------------------------|-------|
| No caching | Full input cost | 5,000 tokens × $3/M = $0.015 |
| With caching | ~10% of input cost | 500 new + 4,500 cached = $0.003 |
| **Savings** | **~80%** | Compounds over many updates |

The longer the conversation, the bigger the savings—exactly when you need compaction most!

### How the Caching Works

The key is in `_add_cache_control()` and `_create_session_memory_cached()`:

```python
# 1. Mark the last conversation message with cache_control
{
    "role": "user",
    "content": [{
        "type": "text",
        "text": msg["content"],
        "cache_control": {"type": "ephemeral"}  # <-- This creates a cache breakpoint
    }]
}

# 2. Also mark the system prompt
system=[{
    "type": "text",
    "text": "You are a session memory agent...",
    "cache_control": {"type": "ephemeral"}
}]
```

**Why this works:**
- The first background update creates a cache entry for `[System + Messages]`
- Subsequent updates with the same message prefix get **cache hits**
- Only the new summarization instruction is billed at full price
- Cache entries have a 5-minute TTL, so rapid updates benefit most

**Cost math:**
- Without caching: 5,000 tokens × $3.00/1M = $0.015 per update
- With caching: 500 new tokens × $3.00/1M + 4,500 cached × $0.30/1M = $0.00285
- **Savings: ~80%** on background summarization costs

## Conclusion

In this cookbook, you learned how to manage long-running Claude conversations through session memory compaction.

### What We Covered

✅ **Effective compaction prompts** - Structure your session memory to preserve user intent, completed work, errors, active work, and key references while discarding filler

✅ **Instant compaction** - Use background threading to proactively build session memory, eliminating user wait time when context limits are reached

✅ **Prompt caching for cost savings** - Reduce background update costs by ~80% by reusing the conversation prefix cache

✅ **Traditional vs. instant patterns** - Understand when to use each approach based on your application needs

### Key Takeaways

1. **Weight recency heavily** - The end of a conversation is the active working context
2. **Preserve user corrections verbatim** - Prevents the model from reverting to old behaviors
3. **Build memory proactively** - Don't wait for context limits; start background updates early
4. **Leverage prompt caching** - Background summarization can share cache with the main conversation

### Next Steps

- **For agentic workflows**: See [Automatic Context Compaction](../tool_use/automatic-context-compaction.ipynb) for SDK-based automatic compaction with tool use
- **For production**: Consider persisting session memory to disk rather than keeping it in memory
- **For optimization**: Experiment with update frequency thresholds to balance cost vs. freshness



---

## Read Web Pages With Haiku

# Summarizing Web Page Content with Claude 3 Haiku
In this recipe, we'll learn how to fetch the content of a web page given its URL and then use Anthropic's Claude API to generate a summary of the page's content.

Let's start by installing the Anthropic library.

## Setup
First, let's install the necessary libraries and setup our Anthropic client with our API key.

```python

# Install the necessary libraries
%pip install anthropic

```

```python

# Import the required libraries
from anthropic import Anthropic

# Set up the Claude API client
client = Anthropic()
MODEL_NAME = "claude-haiku-4-5"

```

## Step 1: Fetching the Web Page Content
First, we need to fetch the content of the web page using the provided URL. We'll use the requests library for this purpose.

```python

import requests

url = "https://en.wikipedia.org/wiki/96th_Academy_Awards"
response = requests.get(url, timeout=30)

if response.status_code == 200:
    page_content = response.text
else:
    print(f"Failed to fetch the web page. Status code: {response.status_code}")
    exit(1)

```

## Step 2: Preparing the Input for Claude
Next, we'll prepare the input for the Claude API. We'll create a message that includes the page content and a prompt asking Claude to summarize it.

```python

prompt = (
    f"<content>{page_content}</content>Please produce a concise summary of the web page content."
)

messages = [{"role": "user", "content": prompt}]

```

## Step 3: Generating the Summary
Now, we'll call the Haiku to generate a summary of the web page content.

```python

response = client.messages.create(model="claude-haiku-4-5", max_tokens=1024, messages=messages)

summary = response.content[0].text
print(summary)

```



---

## Pdf Upload Summarization

# "Uploading" PDFs to Claude Via the API

One really nice feature of [Claude.ai](https://www.claude.ai) is the ability to upload PDFs. Let's mock up that feature in a notebook, and then test it out by summarizing a long PDF.

We'll start by installing the Anthropic client and create an instance of it we will use throughout the notebook.

```python

%pip install anthropic

```

```python

from anthropic import Anthropic
# While PDF support is in beta, you must pass in the correct beta header
client = Anthropic(default_headers={
    "anthropic-beta": "pdfs-2024-09-25"
  }
)
# For now, only claude-sonnet-4-6 supports PDFs
MODEL_NAME = "claude-sonnet-4-6"

```

We already have a PDF available in the `../multimodal/documents` directory. We'll convert the PDF file into base64 encoded bytes. This is the format required for the [PDF document block](https://docs.claude.com/en/docs/build-with-claude/pdf-support) in the Claude API. Note that this type of extraction works for both text and visual elements (like charts and graphs).

```python

import base64


# Start by reading in the PDF and encoding it as base64
file_name = "../multimodal/documents/constitutional-ai-paper.pdf"
with open(file_name, "rb") as pdf_file:
  binary_data = pdf_file.read()
  base64_encoded_data = base64.standard_b64encode(binary_data)
  base64_string = base64_encoded_data.decode("utf-8")

```

With the paper downloaded and in memory, we can ask Claude to perform various fun tasks with it. We'll pass the document ot the model alongside a simple question.

```python

prompt = """
Please do the following:
1. Summarize the abstract at a kindergarten reading level. (In <kindergarten_abstract> tags.)
2. Write the Methods section as a recipe from the Moosewood Cookbook. (In <moosewood_methods> tags.)
3. Compose a short poem epistolizing the results in the style of Homer. (In <homer_results> tags.)
"""
messages = [
    {
        "role": 'user',
        "content": [
            {"type": "document", "source": {"type": "base64", "media_type": "application/pdf", "data": base64_string}},
            {"type": "text", "text": prompt}
        ]
    }
]

```

```python

def get_completion(client, messages):
    return client.messages.create(
        model=MODEL_NAME,
        max_tokens=2048,
        messages=messages
    ).content[0].text

```

```python

completion = get_completion(client, messages)
print(completion)

```

