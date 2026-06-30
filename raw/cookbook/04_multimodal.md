# Claude 多模态（视觉）指南

来源目录: `/multimodal/`



---

## Getting Started With Vision

# Getting started - how to pass images into Claude

The Claude 3 model family supports image inputs in the API. Here’s how you can pass images to Claude:

```python

%pip install anthropic IPython

```

```python

from IPython.display import Image

Image(filename="../images/sunset.jpeg")

```

```python

import base64

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"

with open("../images/sunset.jpeg", "rb") as image_file:
    binary_data = image_file.read()
    base_64_encoded_data = base64.b64encode(binary_data)
    base64_string = base_64_encoded_data.decode("utf-8")


message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {"type": "base64", "media_type": "image/jpeg", "data": base64_string},
            },
            {"type": "text", "text": "Write a sonnet based on this image."},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Passing an image through a url

If you only have a URL of the image you can still pass it to Claude with just a few short lines of code.

```python

IMAGE_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Machu_Picchu%2C_Peru_%282018%29.jpg/2560px-Machu_Picchu%2C_Peru_%282018%29.jpg"
Image(url=IMAGE_URL)

```

```python

import httpx

IMAGE_DATA = base64.b64encode(httpx.get(IMAGE_URL).content).decode("utf-8")

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {"type": "base64", "media_type": "image/jpeg", "data": IMAGE_DATA},
            },
            {"type": "text", "text": "Describe this image in two sentences."},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```



---

## Best Practices For Vision

# Best practices for using vision with Claude

Vision allows for a new mode of interaction with Claude. We’ve compiled a few tips for getting the best performance on your images. Before we get to that, let's first setup the code we need to run the notebook.

```python

%pip install anthropic IPython

```

```python

import base64

from anthropic import Anthropic
from IPython.display import Image

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"


def get_base64_encoded_image(image_path):
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()
        base_64_encoded_data = base64.b64encode(binary_data)
        base64_string = base_64_encoded_data.decode("utf-8")
        return base64_string

```

## Applying traditional techniques to multimodal

You can fix hallucination issues with traditional prompt engineering techniques like role assignment. Let’s see an example of this:

Suppose I want Claude to count the number of dogs in this image:

```python

Image(filename="../images/best_practices/nine_dogs.jpg")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": get_base64_encoded_image("../images/best_practices/nine_dogs.jpg"),
                },
            },
            {"type": "text", "text": "How many dogs are in this picture?"},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

There's only 9 dogs but Claude thinks there is 10! Let’s apply a little prompt engineering and and try again.

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": get_base64_encoded_image("../images/best_practices/nine_dogs.jpg"),
                },
            },
            {
                "type": "text",
                "text": "You have perfect vision and pay great attention to detail which makes you an expert at counting objects in images. How many dogs are in this picture? Before providing the answer in <answer> tags, think step by step in <thinking> tags and analyze every part of the image.",
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

Great! After applying some prompt engineering to the prompt, we see that Claude now counts correctly that there is 9 dogs.

## Visual prompting 

Images as input allows for prompts to now be given within the image itself. Let’s take a look at some examples.

In this image, we write some text and draw an arrow on it. Let’s just pass this in to Claude with no accompanying text prompt.

```python

Image(filename="../images/best_practices/circle.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/circle.png"),
                },
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

As you can see, Claude tried to describe the image as we didn’t give it a question. Let’s add a question to the image and pass it in again.

```python

Image(filename="../images/best_practices/labeled_circle.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/labeled_circle.png"),
                },
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

We can also highlight specific parts of the image and ask questions about it.

What’s the difference between these two numbers?

```python

Image(filename="../images/best_practices/table.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/table.png"),
                },
            },
            {"type": "text", "text": "What’s the difference between these two numbers?"},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Few-shot examples

Adding examples to prompts still improves accuracy with visual tasks as well. Let’s ask Claude to read a picture of a speedometer.

```python

Image(filename="../images/best_practices/140.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/140.png"),
                },
            },
            {"type": "text", "text": "What speed am I going?"},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

Claude’s answer doesn’t look quite right here, it thinks we are going 140km/hour and not 140 miles/hour! Let’s try again but this time let’s add some examples to the prompt.

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/70.png"),
                },
            },
            {"type": "text", "text": "What speed am I going?"},
        ],
    },
    {
        "role": "assistant",
        "content": [{"type": "text", "text": "You are going 70 miles per hour."}],
    },
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/100.png"),
                },
            },
            {"type": "text", "text": "What speed am I going?"},
        ],
    },
    {
        "role": "assistant",
        "content": [{"type": "text", "text": "You are going 100 miles per hour."}],
    },
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/140.png"),
                },
            },
            {"type": "text", "text": "What speed am I going?"},
        ],
    },
]

response = client.messages.create(
    model=MODEL_NAME, max_tokens=2048, messages=message_list, temperature=0
)
print(response.content[0].text)

```

Perfect! With those examples, Claude learned how to read the speed on the speedometer. Note though that few-shot prompting with images doesn't always work but it is worth trying on your use case.

## Multiple images as input
Claude can also accept and reason over multiple images at once within the prompt as well! For example, let’s say you had a really large image - like an image of a long receipt! We can split that image up into chunks and feed each one of those chunks into Claude.

```python

Image(filename="../images/best_practices/receipt1.png")

```

```python

Image(filename="../images/best_practices/receipt2.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/receipt1.png"),
                },
            },
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/receipt2.png"),
                },
            },
            {"type": "text", "text": "Output the name of the restaurant and the total."},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Object identification from examples

With image input, you can pass in other images to the prompt and Claude will use that information to answer questions. Let’s see an example of this. 

Suppose we were trying to identify the type of pant in an image. We can provide Claude some examples of different types of pants in the prompt.

```python

Image(filename="../images/best_practices/officer_example.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/wrinkle.png"),
                },
            },
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/officer.png"),
                },
            },
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/best_practices/chinos.png"),
                },
            },
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image(
                        "../images/best_practices/officer_example.png"
                    ),
                },
            },
            {
                "type": "text",
                "text": "These pants are (in order) WRINKLE-RESISTANT DRESS PANT, ITALIAN MELTON OFFICER PANT, SLIM RAPID MOVEMENT CHINO. What pant is shown in the last image?",
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```



---

## How To Transcribe Text

# How to transcribe documents with Claude

Claude 3 is great at reading unstructured text and information within images and PDFs and turning it into structured text. We'll take a look at a few examples but first let's setup the code we need to run the notebook.

```python

%pip install anthropic IPython

```

```python

import base64

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"


def get_base64_encoded_image(image_path):
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()
        base_64_encoded_data = base64.b64encode(binary_data)
        base64_string = base_64_encoded_data.decode("utf-8")
        return base64_string

```

## Transcribing typed text

The advantage of using Claude 3 over traditional OCR systems is that you can specify exactly what you want to transcribe due to Claude 3's advanced reasoning capabilities. For this image, let’s transcribe just the code in the answer.

```python

from IPython.display import Image

Image(filename="../images/transcribe/stack_overflow.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/transcribe/stack_overflow.png"),
                },
            },
            {"type": "text", "text": "Transcribe the code in the answer. Only output the code."},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Transcribing handwritten text

That's good but let's try something a little harder. Claude 3 excels at transcribing handwritten text as well. Let's ask Claude 3 to transcribe this handwritten prescription note.

```python

Image(filename="../images/transcribe/school_notes.png")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/transcribe/school_notes.png"),
                },
            },
            {
                "type": "text",
                "text": "Transcribe this text. Only output the text and nothing else.",
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Transcribing forms
How about we try a combination of typed and handwritten text? This is common across a variety of documents like insurance and report forms.

```python

Image(filename="../images/transcribe/vehicle_form.jpg")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": get_base64_encoded_image("../images/transcribe/vehicle_form.jpg"),
                },
            },
            {"type": "text", "text": "Transcribe this form exactly."},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Complicated document QA
With Claude 3 we can go beyond just transcription and ask specific questions about our information in our unstructured documents.

```python

Image(filename="../images/transcribe/page.jpeg")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": get_base64_encoded_image("../images/transcribe/page.jpeg"),
                },
            },
            {"type": "text", "text": "Which is the most critical issue for live rep support?"},
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```

## Unstructured information -> JSON

Let's take a look at how you can use Claude to turn unstructured information in an image into a structured JSON output.

```python

Image(filename="../images/transcribe/org_chart.jpeg")

```

```python

message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/jpeg",
                    "data": get_base64_encoded_image("../images/transcribe/org_chart.jpeg"),
                },
            },
            {
                "type": "text",
                "text": "Turn this org chart into JSON indicating who reports to who. Only output the JSON and nothing else.",
            },
        ],
    }
]

response = client.messages.create(model=MODEL_NAME, max_tokens=2048, messages=message_list)
print(response.content[0].text)

```



---

## Reading Charts Graphs Powerpoints

# Working with Charts, Graphs, and Slide Decks
Claude is highly capable of working with charts, graphs, and broader slide decks. Depending on your use case, there are a number of tips and tricks that you may want to take advantage of. This recipe will show you common patterns for using Claude with these materials.

## Charts and Graphs
For the most part, using claude with charts and graphs is simple. Let's walk through how to ingest them and pass them to Claude, as well as some common tips to improve your results.

### Ingestion and calling the Claude API
The best way to pass Claude charts and graphs is to take advantage of its vision capabilities and the PDF support feature. That is, give Claude a PDF document of the chart or graph, along with a text question about it.

At the moment, only `claude-sonnet-4-6` supports the PDF feature. Since the feature is still in beta, you will need to provide it with the `pdfs-2024-09-25` beta header.

```python

# Install and create the Anthropic client.
%pip install anthropic

```

```python

import base64

from anthropic import Anthropic

# While PDF support is in beta, you must pass in the correct beta header
client = Anthropic(default_headers={"anthropic-beta": "pdfs-2024-09-25"})
# For now, only claude-sonnet-4-6 supports PDFs
MODEL_NAME = "claude-sonnet-4-6"

```

```python

# Make a useful helper function.
def get_completion(messages):
    response = client.messages.create(
        model=MODEL_NAME, max_tokens=8192, temperature=0, messages=messages
    )
    return response.content[0].text

```

```python

# To start, we'll need a PDF. We will be using the .pdf document located at cvna_2021_annual_report.pdf.
# Start by reading in the PDF and encoding it as base64.
with open("./documents/cvna_2021_annual_report.pdf", "rb") as pdf_file:
    binary_data = pdf_file.read()
    base_64_encoded_data = base64.b64encode(binary_data)
    base64_string = base_64_encoded_data.decode("utf-8")

```

Let's see how we can pass this document to the model alongside a simple question.

```python

messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64_string,
                },
            },
            {"type": "text", "text": "What's in this document? Answer in a single sentence."},
        ],
    }
]

print(get_completion(messages))

```

That's pretty good! Now let's ask it some more useful questions.

```python

questions = [
    "What was CVNA revenue in 2020?",
    "How many additional markets has Carvana added since 2014?",
    "What was 2016 revenue per retail unit sold?",
]

for index, question in enumerate(questions):
    messages = [
        {
            "role": "user",
            "content": [
                {
                    "type": "document",
                    "source": {
                        "type": "base64",
                        "media_type": "application/pdf",
                        "data": base64_string,
                    },
                },
                {"type": "text", "text": question},
            ],
        }
    ]

    print(f"\n----------Question {index + 1}----------")
    print(get_completion(messages))

```

As you can see, Claude is capable of answering fairly detailed questions about charts and graphs. However, there are some tips and tricks that will help you get the most out of it.
- Sometimes Claude's arithmetic capabilities get in the way. You'll notice that if you sample the third question above it will occasionally output an incorrect final answer because it messes up the arithmetic. Consider providing Claude with a calculator tool to ensure it doesn't make these types of mistakes.
- With super complicated charts and graphs, we can ask Claude to "First describe every data point you see in the document" as a way to elicit similar improvements to what we seen in traditional Chain of Thought.
- Claude occasionally struggles with charts that depend on lots of colors to convey information, such as grouped bar charts with many groups. Asking Claude to first identify the colors in your graph using HEX codes can boost its accuracy.

## Slide Decks
Now that we know Claude is a charts and graphs wizard, it is only logical that we extend it to the true home of charts and graphs - slide decks!

Slides represent a critical source of information for many domains, including financial services. While you *can* use packages like PyPDF to extract text from slide decks, their chart/graph heavy nature often makes this a poor choice as models will struggle to access the information they actually need.

The PDF support feature can be a great replacement as a result. It uses both extracted text and vision in order when processing PDF documents. In this section we will go over how to use PDF documents in Claude to review slide decks, and how to deal with some common pitfalls of this approach.

The best way to get a typical slide deck into claude is to download it as a PDF and provide it directly to Claude.

```python

# Open the multi-page PDF document the same way we did earlier.
with open("./documents/twilio_q4_2023.pdf", "rb") as pdf_file:
    binary_data = pdf_file.read()
    base_64_encoded_data = base64.b64encode(binary_data)
    base64_string = base_64_encoded_data.decode("utf-8")

```

```python

# Now let's pass the document directly to Claude. Note that Claude will process both the text and visual elements of the document.
question = "What was Twilio y/y revenue growth for fiscal year 2023?"
content = [
    {
        "type": "document",
        "source": {"type": "base64", "media_type": "application/pdf", "data": base64_string},
    },
    {"type": "text", "text": question},
]

messages = [{"role": "user", "content": content}]

print(get_completion(messages))

```

This approach is a great way to get started, and for some use cases offers the best performance. However, there are some limitations.
- You can only include a total of 100 pages across all provided documents in a request (we intend to increase this limit over time).
- If you are using slide content as part of RAG, introducing multimodal PDFs into your embeddings can cause problems

Luckily, we can take advantage of Claude's vision capabilities to get a much higher quality representation of the slide deck **in text form** than normal pdf text extraction allows.

We find the best way to do this is to ask Claude to sequentially narrate the deck from start to finish, passing it the current slide and its prior narration. Let's see how.

```python

# Define a prompt for narrating our slide deck. We would adjut this prompt based on the nature of the deck, but keep the structure largely the same.
prompt = """
You are the Twilio CFO, narrating your Q4 2023 earnings presentation.

The entire earnings presentation document is provided to you.
Please narrate this presentation from Twilio's Q4 2023 Earnings as if you were the presenter. Do not talk about any things, especially acronyms, if you are not exactly sure you know what they mean.

Do not leave any details un-narrated as some of your viewers are vision-impaired, so if you don't narrate every number they won't know the number.

Structure your response like this:
<narration>
    <page_narration id=1>
    [Your narration for page 1]
    </page_narration>

    <page_narration id=2>
    [Your narration for page 2]
    </page_narration>

    ... and so on for each page
</narration>

Use excruciating detail for each page, ensuring you describe every visual element and number present. Show the full response in a single message.
"""
messages = [
    {
        "role": "user",
        "content": [
            {
                "type": "document",
                "source": {
                    "type": "base64",
                    "media_type": "application/pdf",
                    "data": base64_string,
                },
            },
            {"type": "text", "text": prompt},
        ],
    }
]

# Now we use our prompt to narrate the entire deck. Note that this may take a few minutes to run (often up to 10).
completion = get_completion(messages)

```

```python

import re

# Next we'll parse the response from Claude using regex
pattern = r"<narration>(.*?)</narration>"
match = re.search(pattern, completion.strip(), re.DOTALL)
if match:
    narration = match.group(1)
else:
    raise ValueError("No narration available. Likely due to the model response being truncated.")

```

Now that we have a text-based narration (it's far from perfect but it's pretty good), we have the ability to use this deck with any text-only workflow. Including vector search!

As a final sanity check, let's ask a few questions of our narration-only setup!

```python

questions = [
    "What percentage of q4 total revenue was the Segment business line?",
    "Has the rate of growth of quarterly revenue been increasing or decreasing? Give just an answer.",
    "What was acquisition revenue for the year ended december 31, 2023 (including negative revenues)?",
]

for index, question in enumerate(questions):
    prompt = f"""You are an expert financial analyst analyzing a transcript of Twilio's earnings call.
Here is the transcript:
<transcript>
{narration}
</transcript>

Please answer the following question:
<question>
{question}
</question>"""
    messages = [{"role": "user", "content": [{"type": "text", "text": prompt}]}]

    print(f"\n----------Question {index + 1}----------")
    print(get_completion(messages))

```

Looks good! With these techniques at your side, you are ready to start applying models to chart and graph heavy content like slide decks.

