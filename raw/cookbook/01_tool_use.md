# Claude Tool Use 工具使用指南

来源目录: `/tool_use/`



---

## customer_service_agent

# Creating a Customer Service Agent with Client-Side Tools

In this recipe, we'll demonstrate how to create a customer service chatbot using Claude 3 plus client-side tools. The chatbot will be able to look up customer information, retrieve order details, and cancel orders on behalf of the customer. We'll define the necessary tools and simulate synthetic responses to showcase the chatbot's capabilities.

## Step 1: Set up the environment

First, let's install the required libraries and set up the Claude API client.

```python

%pip install anthropic

```

```python

import anthropic

client = anthropic.Client()
MODEL_NAME = "claude-opus-4-1"

```

## Step 2: Define the client-side tools

Next, we'll define the client-side tools that our chatbot will use to assist customers. We'll create three tools: get_customer_info, get_order_details, and cancel_order.

```python

tools = [
    {
        "name": "get_customer_info",
        "description": "Retrieves customer information based on their customer ID. Returns the customer's name, email, and phone number.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_id": {
                    "type": "string",
                    "description": "The unique identifier for the customer.",
                }
            },
            "required": ["customer_id"],
        },
    },
    {
        "name": "get_order_details",
        "description": "Retrieves the details of a specific order based on the order ID. Returns the order ID, product name, quantity, price, and order status.",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The unique identifier for the order.",
                }
            },
            "required": ["order_id"],
        },
    },
    {
        "name": "cancel_order",
        "description": "Cancels an order based on the provided order ID. Returns a confirmation message if the cancellation is successful.",
        "input_schema": {
            "type": "object",
            "properties": {
                "order_id": {
                    "type": "string",
                    "description": "The unique identifier for the order to be cancelled.",
                }
            },
            "required": ["order_id"],
        },
    },
]

```

## Step 3: Simulate synthetic tool responses

Since we don't have real customer data or order information, we'll simulate synthetic responses for our tools. In a real-world scenario, these functions would interact with your actual customer database and order management system.

```python

def get_customer_info(customer_id):
    # Simulated customer data
    customers = {
        "C1": {"name": "John Doe", "email": "john@example.com", "phone": "123-456-7890"},
        "C2": {"name": "Jane Smith", "email": "jane@example.com", "phone": "987-654-3210"},
    }
    return customers.get(customer_id, "Customer not found")


def get_order_details(order_id):
    # Simulated order data
    orders = {
        "O1": {
            "id": "O1",
            "product": "Widget A",
            "quantity": 2,
            "price": 19.99,
            "status": "Shipped",
        },
        "O2": {
            "id": "O2",
            "product": "Gadget B",
            "quantity": 1,
            "price": 49.99,
            "status": "Processing",
        },
    }
    return orders.get(order_id, "Order not found")


def cancel_order(order_id):
    # Simulated order cancellation
    if order_id in ["O1", "O2"]:
        return True
    else:
        return False

```

## Step 4: Process tool calls and return results

We'll create a function to process the tool calls made by Claude and return the appropriate results.

```python

def process_tool_call(tool_name, tool_input):
    if tool_name == "get_customer_info":
        return get_customer_info(tool_input["customer_id"])
    elif tool_name == "get_order_details":
        return get_order_details(tool_input["order_id"])
    elif tool_name == "cancel_order":
        return cancel_order(tool_input["order_id"])

```

## Step 5: Interact with the chatbot

Now, let's create a function to interact with the chatbot. We'll send a user message, process any tool calls made by Claude, and return the final response to the user.

```python

import json


def chatbot_interaction(user_message):
    print(f"\n{'=' * 50}\nUser Message: {user_message}\n{'=' * 50}")

    messages = [{"role": "user", "content": user_message}]

    response = client.messages.create(
        model=MODEL_NAME, max_tokens=4096, tools=tools, messages=messages
    )

    print("\nInitial Response:")
    print(f"Stop Reason: {response.stop_reason}")
    print(f"Content: {response.content}")

    while response.stop_reason == "tool_use":
        tool_use = next(block for block in response.content if block.type == "tool_use")
        tool_name = tool_use.name
        tool_input = tool_use.input

        print(f"\nTool Used: {tool_name}")
        print("Tool Input:")
        print(json.dumps(tool_input, indent=2))

        tool_result = process_tool_call(tool_name, tool_input)

        print("\nTool Result:")
        print(json.dumps(tool_result, indent=2))

        messages = [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": response.content},
            {
                "role": "user",
                "content": [
                    {
                        "type": "tool_result",
                        "tool_use_id": tool_use.id,
                        "content": str(tool_result),
                    }
                ],
            },
        ]

        response = client.messages.create(
            model=MODEL_NAME, max_tokens=4096, tools=tools, messages=messages
        )

        print("\nResponse:")
        print(f"Stop Reason: {response.stop_reason}")
        print(f"Content: {response.content}")

    final_response = next(
        (block.text for block in response.content if hasattr(block, "text")),
        None,
    )

    print(f"\nFinal Response: {final_response}")

    return final_response

```

## Step 6: Test the chatbot
Let's test our customer service chatbot with a few sample queries.

```python

chatbot_interaction("Can you tell me the email address for customer C1?")
chatbot_interaction("What is the status of order O2?")
chatbot_interaction("Please cancel order O1 for me.")

```

And that's it! We've created a customer service chatbot using Claude 3 models and client-side tools. The chatbot can look up customer information, retrieve order details, and cancel orders based on the user's requests. By defining clear tool descriptions and schemas, we enable Claude to effectively understand and utilize the available tools to assist customers.

Feel free to expand on this example by integrating with your actual customer database and order management system, and by adding more tools to handle a wider range of customer service tasks.



---

## calculator_tool

# Using a Calculator Tool with Claude
In this recipe, we'll demonstrate how to provide Claude with a simple calculator tool that it can use to perform arithmetic operations based on user input. We'll define the calculator tool and show how Claude can interact with it to solve mathematical problems.

## Step 1: Set up the environment

First, let's install the required libraries and set up the Claude API client.

```python

%pip install anthropic

```

```python

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"

```

## Step 2: Define the calculator tool
We'll define a simple calculator tool that can perform basic arithmetic operations. The tool will take a mathematical expression as input and return the result. 

Note that we are calling ```eval``` on the outputted expression. This is bad practice and should not be used generally but we are doing it for the purpose of demonstration.

```python

import re


def calculate(expression):
    # Remove any non-digit or non-operator characters from the expression
    expression = re.sub(r"[^0-9+\-*/().]", "", expression)

    try:
        # Evaluate the expression using the built-in eval() function
        # Note: eval is used here for demonstration purposes only.
        # In production, use a safer alternative like ast.literal_eval or a math parser.
        result = eval(expression)  # noqa: S307
        return str(result)
    except (SyntaxError, ZeroDivisionError, NameError, TypeError, OverflowError):
        return "Error: Invalid expression"


tools = [
    {
        "name": "calculator",
        "description": "A simple calculator that performs basic arithmetic operations.",
        "input_schema": {
            "type": "object",
            "properties": {
                "expression": {
                    "type": "string",
                    "description": "The mathematical expression to evaluate (e.g., '2 + 3 * 4').",
                }
            },
            "required": ["expression"],
        },
    }
]

```

In this example, we define a calculate function that takes a mathematical expression as input, removes any non-digit or non-operator characters using a regular expression, and then evaluates the expression using the built-in eval() function. If the evaluation is successful, the result is returned as a string. If an error occurs during evaluation, an error message is returned.

We then define the calculator tool with an input schema that expects a single expression property of type string.

## Step 3: Interact with Claude
Now, let's see how Claude can interact with the calculator tool to solve mathematical problems.

```python

def process_tool_call(tool_name, tool_input):
    if tool_name == "calculator":
        return calculate(tool_input["expression"])


def chat_with_claude(user_message):
    print(f"\n{'=' * 50}\nUser Message: {user_message}\n{'=' * 50}")

    message = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        messages=[{"role": "user", "content": user_message}],
        tools=tools,
    )

    print("\nInitial Response:")
    print(f"Stop Reason: {message.stop_reason}")
    print(f"Content: {message.content}")

    if message.stop_reason == "tool_use":
        tool_use = next(block for block in message.content if block.type == "tool_use")
        tool_name = tool_use.name
        tool_input = tool_use.input

        print(f"\nTool Used: {tool_name}")
        print(f"Tool Input: {tool_input}")

        tool_result = process_tool_call(tool_name, tool_input)

        print(f"Tool Result: {tool_result}")

        response = client.messages.create(
            model=MODEL_NAME,
            max_tokens=4096,
            messages=[
                {"role": "user", "content": user_message},
                {"role": "assistant", "content": message.content},
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "tool_result",
                            "tool_use_id": tool_use.id,
                            "content": tool_result,
                        }
                    ],
                },
            ],
            tools=tools,
        )
    else:
        response = message

    final_response = next(
        (block.text for block in response.content if hasattr(block, "text")),
        None,
    )
    print(response.content)
    print(f"\nFinal Response: {final_response}")

    return final_response

```

## Step 4: Try it out!

Let's try giving Claude a few example math questions now that it has access to a calculator.

```python

chat_with_claude("What is the result of 1,984,135 * 9,343,116?")
chat_with_claude("Calculate (12851 - 593) * 301 + 76")
chat_with_claude("What is 15910385 divided by 193053?")

```



---

## parallel_tools

# Parallel tool calls on Claude 3.7 Sonnet

Claude 3.7 Sonnet may be less likely to make make parallel tool calls in a response, even when you have not set `disable_parallel_tool_use`. To work around this, we recommend introducing a "batch tool" that can act as a meta-tool to wrap invocations to other tools simultaneously. We find that if this tool is present, the model will use it to simultaneously call multiple tools in parallel for you.

Let's take a look at the problem, and examine this workaround in more detail.

```python

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-sonnet-4-6"

```

## Performing a query with multiple tool calls

Recall that the default behavior is for Claude to be allowed parallel tool calls. Combined with the default `tool_choice` of `auto`, this means that Claude can call any of the specified tools, or call more than one of them in a single assistant turn.

Let's set Claude up with a `get_weather` and `get_time` tool.

```python

def get_weather(location):
    # Pretend to get the weather, and just return a fixed value.
    return f"The weather in {location} is 72 degrees and sunny."


def get_time(location):
    # Pretend to get the time, and just return a fixed value.
    return f"The time in {location} is 12:32 PM."


weather_tool = {
    "name": "get_weather",
    "description": "Gets the weather for in a given location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city and state, e.g. San Francisco, CA",
            },
        },
        "required": ["location"],
    },
}

time_tool = {
    "name": "get_time",
    "description": "Gets the time in a given location",
    "input_schema": {
        "type": "object",
        "properties": {
            "location": {
                "type": "string",
                "description": "The city and state, e.g. San Francisco, CA",
            },
        },
        "required": ["location"],
    },
}


def process_tool_call(tool_name, tool_input):
    if tool_name == "get_weather":
        return get_weather(tool_input["location"])
    elif tool_name == "get_time":
        return get_time(tool_input["location"])
    else:
        raise ValueError(f"Unexpected tool name: {tool_name}")

```

Next, let's provide Claude with these tools and perform a query.

```python

def make_query_and_print_result(messages, tools=None):
    response = client.messages.create(
        model=MODEL_NAME,
        messages=messages,
        max_tokens=1000,
        tool_choice={"type": "auto"},
        tools=tools or [weather_tool, time_tool],
    )

    for block in response.content:
        match block.type:
            case "text":
                print(block.text)
            case "tool_use":
                print(f"Tool: {block.name}({block.input})")
            case _:
                raise ValueError(f"Unexpected block type: {block.type}")

    return response


MESSAGES = [{"role": "user", "content": "What's the weather and time in San Francisco?"}]

response = make_query_and_print_result(MESSAGES)

```

Notice how claude returned with a single tool call for the weather, even though we asked for both?

Let's see what happens if we call the weather tool and proceed.

```python

last_tool_call = response.content[1]

MESSAGES.append({"role": "assistant", "content": response.content})
MESSAGES.append(
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": last_tool_call.id,
                "content": process_tool_call(response.content[1].name, response.content[1].input),
            }
        ],
    }
)

response = make_query_and_print_result(MESSAGES)

```

Notice now that Claude made a second tool call to get the time. While this technically happened immediately, this is potentially wasteful because it required "back and forth" – first Claude asked for the weather, then we had to process it, and _then_ Claude asked for the time, and now we have to process _that_.

Claude will still do the right thing with the results, but it may be beneficial to encourage Claude to use both in one call, so we can process it simultaneously.

## Introducing a batch tool

Let's introduce a `batch_tool`, so that Claude can have an opportunity to use it to combine multiple tool calls into one.

```python

import json

batch_tool = {
    "name": "batch_tool",
    "description": "Invoke multiple other tool calls simultaneously",
    "input_schema": {
        "type": "object",
        "properties": {
            "invocations": {
                "type": "array",
                "description": "The tool calls to invoke",
                "items": {
                    "types": "object",
                    "properties": {
                        "name": {
                            "types": "string",
                            "description": "The name of the tool to invoke",
                        },
                        "arguments": {
                            "types": "string",
                            "description": "The arguments to the tool",
                        },
                    },
                    "required": ["name", "arguments"],
                },
            }
        },
        "required": ["invocations"],
    },
}


def process_tool_with_maybe_batch(tool_name, tool_input):
    if tool_name == "batch_tool":
        results = []
        for invocation in tool_input["invocations"]:
            results.append(
                process_tool_call(invocation["name"], json.loads(invocation["arguments"]))
            )
        return "\n".join(results)
    else:
        return process_tool_call(tool_name, tool_input)

```

Now let's try to provide Claude with the existing weather and time tool, along with this new batch tool, and see what happens when we make a query requiring the weather and time.

```python

MESSAGES = [{"role": "user", "content": "What's the weather and time in San Francisco?"}]

response = make_query_and_print_result(MESSAGES, tools=[weather_tool, time_tool, batch_tool])

```

Notice how this time, Claude used the batch tool to query both the time and weather in one go. This allows us to process them simultaneously, potentially improving overall latency to the result.

```python

last_tool_call = response.content[1]

MESSAGES.append({"role": "assistant", "content": response.content})
MESSAGES.append(
    {
        "role": "user",
        "content": [
            {
                "type": "tool_result",
                "tool_use_id": last_tool_call.id,
                "content": process_tool_with_maybe_batch(
                    response.content[1].name, response.content[1].input
                ),
            }
        ],
    }
)

response = make_query_and_print_result(MESSAGES)

```



---

## tool_choice

# Tool choice

Tool use supports a parameter called `tool_choice` that allows you to specify how you want Claude to call tools. In this notebook, we'll take a look at how it works and when to use it. Before going any further, make sure you are comfortable with the basics of tool use with Claude.

When working with the `tool_choice` parameter, we have three possible options: 

* `auto` allows Claude to decide whether to call any provided tools or not
* `tool` allows us to force Claude to always use a particular tool
* `any` tells Claude that it must use one of the provided tools, but doesn't force a particular tool

Let's take a look at each option in detail. We'll start by importing the Anthropic SDK:

```python

from anthropic import Anthropic

client = Anthropic()
MODEL_NAME = "claude-sonnet-4-6"

```

## Auto

Setting `tool_choice` to `auto` allows the model to automatically decide whether to use tools or not.  This is the default behavior when working with tools. 

To demonstrate this, we're going to provide Claude with a fake web search tool. We will ask Claude questions, some of which would require calling the web search tool and other which Claude should be able to answer on its own.

Let's start by defining a tool called `web_search`.  Please note, to keep this demo simple, we're not actually searching the web here:

```python

def web_search(topic):
    print(f"pretending to search the web for {topic}")


web_search_tool = {
    "name": "web_search",
    "description": "A tool to retrieve up to date information on a given topic by searching the web",
    "input_schema": {
        "type": "object",
        "properties": {
            "topic": {"type": "string", "description": "The topic to search the web for"},
        },
        "required": ["topic"],
    },
}

```

Next, we write a function that accepts a user_query and passes it along to Claude, along with the `web_search_tool`. 

We also set `tool_choice` to `auto`:

```py
tool_choice={"type": "auto"}
```

Here's the complete function:

```python

from datetime import date


def chat_with_web_search(user_query):
    messages = [{"role": "user", "content": user_query}]

    system_prompt = f"""
    Answer as many questions as you can using your existing knowledge.
    Only search the web for queries that you can not confidently answer.
    Today's date is {date.today().strftime("%B %d %Y")}
    If you think a user's question involves something in the future that hasn't happened yet, use the search tool.
    """

    response = client.messages.create(
        system=system_prompt,
        model=MODEL_NAME,
        messages=messages,
        max_tokens=1000,
        tool_choice={"type": "auto"},
        tools=[web_search_tool],
    )
    last_content_block = response.content[-1]
    if last_content_block.type == "text":
        print("Claude did NOT call a tool")
        print(f"Assistant: {last_content_block.text}")
    elif last_content_block.type == "tool_use":
        print("Claude wants to use a tool")
        print(last_content_block)

```

Let's start with a question Claude should be able to answer without using the tool:

```python

chat_with_web_search("What color is the sky?")

```

When we ask "What color is the sky?", Claude does not use the tool.  Let's try asking something that Claude should use the web search tool to answer:

```python

chat_with_web_search("Who won the 2024 Miami Grand Prix?")

```

When we ask "Who won the 2024 Miami Grand Prix?", Claude uses the web search tool! 

Let's try a few more examples:

```python

# Claude should NOT need to use the tool for this:
chat_with_web_search("Who won the superbowl in 2022?")

```

```python

# Claude SHOULD use the tool for this:
chat_with_web_search("Who won the superbowl in 2024?")

```

### Your Prompt Matters!

When working with `tool_choice` of `auto`, it's important that you spend time to write a detailed prompt.  Often, Claude can be over-eager to call tools.  Writing a detailed prompt helps Claude determine when to call a tool and when not to.  In the above example, we included specific instructions in the system prompt: 


```py
 system_prompt=f"""
    Answer as many questions as you can using your existing knowledge.  
    Only search the web for queries that you can not confidently answer.
    Today's date is {date.today().strftime("%B %d %Y")}
    If you think a user's question involves something in the future that hasn't happened yet, use the search tool.
"""
```

## Forcing a specific tool

We can force Claude to use a particular tool using `tool_choice`.  In the example below, we've defined two simple tools: 
* `print_sentiment_scores` - a tool that "tricks" Claude into generating well-structured JSON output containing sentiment analysis data.  For more info on this approach, see [Extracting Structured JSON using Claude and Tool Use](https://github.com/anthropics/anthropic-cookbook/blob/main/tool_use/extracting_structured_json.ipynb)
* `calculator` - a very simple calculator tool that takes two numbers and adds them together

```python

tools = [
    {
        "name": "print_sentiment_scores",
        "description": "Prints the sentiment scores of a given tweet or piece of text.",
        "input_schema": {
            "type": "object",
            "properties": {
                "positive_score": {
                    "type": "number",
                    "description": "The positive sentiment score, ranging from 0.0 to 1.0.",
                },
                "negative_score": {
                    "type": "number",
                    "description": "The negative sentiment score, ranging from 0.0 to 1.0.",
                },
                "neutral_score": {
                    "type": "number",
                    "description": "The neutral sentiment score, ranging from 0.0 to 1.0.",
                },
            },
            "required": ["positive_score", "negative_score", "neutral_score"],
        },
    },
    {
        "name": "calculator",
        "description": "Adds two number",
        "input_schema": {
            "type": "object",
            "properties": {
                "num1": {"type": "number", "description": "first number to add"},
                "num2": {"type": "number", "description": "second number to add"},
            },
            "required": ["num1", "num2"],
        },
    },
]

```

Our goal is to write a function called `analyze_tweet_sentiment` that takes a tweet and prints a basic sentiment analysis of that tweet.  Eventually we will "force" Claude to use our sentiment analysis tool, but we'll start by showing what happens when we **do not** force the tool use. 

In this first "bad" version of the `analyze_tweet_sentiment` function, we provide Claude with both tools. For the sake of comparison, we'll start by setting tool_choice to "auto":

```py
tool_choice={"type": "auto"}
```

Please note that we are deliberately not providing Claude with a well-written prompt, to make it easier to see the impact of forcing the use of a particular tool.

```python

def analyze_tweet_sentiment(query):
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        tools=tools,
        tool_choice={"type": "auto"},
        messages=[{"role": "user", "content": query}],
    )
    print(response)

```

Let's see what happens when we call the function with the tweet "Holy cow, I just made the most incredible meal!"

```python

analyze_tweet_sentiment("Holy cow, I just made the most incredible meal!")

```

Claude does not call our sentiment analysis tool:
> "That's great to hear! I don't actually have the capability to assess sentiment from text, but it sounds like you're really excited and proud of the incredible meal you made

Next, let's imagine someone tweets this: "I love my cats! I had four and just adopted 2 more! Guess how many I have now?"

```python

analyze_tweet_sentiment(
    "I love my cats! I had four and just adopted 2 more! Guess how many I have now?"
)

```

Claude wants to call the calculator tool:

> ToolUseBlock(id='toolu_staging_01RFker5oMQoY6jErz5prmZg', input={'num1': 4, 'num2': 2}, name='calculator', type='tool_use')

Clearly, this current implementation is not doing what we want (mostly because we set it up to fail). 

Next, let's force Claude to **always** use the `print_sentiment_scores` tool by updating `tool_choice`:

```py
tool_choice={"type": "tool", "name": "print_sentiment_scores"}
```

In addition to setting `type` to `tool`, we must provide a particular tool name.

```python

def analyze_tweet_sentiment(query):
    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        tools=tools,
        tool_choice={"type": "tool", "name": "print_sentiment_scores"},
        messages=[{"role": "user", "content": query}],
    )
    print(response)

```

Now if we try prompting Claude with the same prompts from earlier, it's always going to call the `print_sentiment_scores` tool:

```python

analyze_tweet_sentiment("Holy cow, I just made the most incredible meal!")

```

Claude calls our `print_sentiment_scores` tool:

> ToolUseBlock(id='toolu_staging_01FMRQ9pZniZqFUGQwTcFU4N', input={'positive_score': 0.9, 'negative_score': 0.0, 'neutral_score': 0.1}, name='print_sentiment_scores', type='tool_use')

Even if we try to trip up Claude with a "Math-y" tweet, it still always calls the `print_sentiment_scores` tool:

```python

analyze_tweet_sentiment(
    "I love my cats! I had four and just adopted 2 more! Guess how many I have now?"
)

```

Even though we're forcing Claude to call our `print_sentiment_scores` tool, we should still employ some basic prompt engineering:

```python

def analyze_tweet_sentiment(query):
    prompt = f"""
    Analyze the sentiment in the following tweet:
    <tweet>{query}</tweet>
    """

    response = client.messages.create(
        model=MODEL_NAME,
        max_tokens=4096,
        tools=tools,
        tool_choice={"type": "auto"},
        messages=[{"role": "user", "content": prompt}],
    )
    print(response)

```

## Any

The final option for `tool_choice` is `any` which allows us to tell Claude "you must call a tool, but you can pick which one".  Imagine we want to create a SMS chatbot using Claude.  The only way for this chatbot to actually "communicate" with a user is via SMS text message. 

In the example below, we make a very simple text-messaging assistant that has access to two tools:
* `send_text_to_user` sends a text message to a user
* `get_customer_info` looks up customer data based on a username

The idea is to create a chatbot that always calls one of these tools and never responds with a non-tool response.  In all situations, Claude should either respond back by trying to send a text message or calling `get_customer_info` to get more customer information.

Most importantly, we set `tool_choice` to "any":

```py
tool_choice={"type": "any"}
```

```python

def send_text_to_user(text):
    # Sends a text to the user
    # We'll just print out the text to keep things simple:
    print(f"TEXT MESSAGE SENT: {text}")


def get_customer_info(username):
    return {
        "username": username,
        "email": f"{username}@email.com",
        "purchases": [
            {"id": 1, "product": "computer mouse"},
            {"id": 2, "product": "screen protector"},
            {"id": 3, "product": "usb charging cable"},
        ],
    }


tools = [
    {
        "name": "send_text_to_user",
        "description": "Sends a text message to a user",
        "input_schema": {
            "type": "object",
            "properties": {
                "text": {
                    "type": "string",
                    "description": "The piece of text to be sent to the user via text message",
                },
            },
            "required": ["text"],
        },
    },
    {
        "name": "get_customer_info",
        "description": "gets information on a customer based on the customer's username.  Response includes email, username, and previous purchases. Only call this tool once a user has provided you with their username",
        "input_schema": {
            "type": "object",
            "properties": {
                "username": {
                    "type": "string",
                    "description": "The username of the user in question. ",
                },
            },
            "required": ["username"],
        },
    },
]

system_prompt = """
All your communication with a user is done via text message.
Only call tools when you have enough information to accurately call them.
Do not call the get_customer_info tool until a user has provided you with their username. This is important.
If you do not know a user's username, simply ask a user for their username.
"""


def sms_chatbot(user_message):
    messages = [{"role": "user", "content": user_message}]

    response = client.messages.create(
        system=system_prompt,
        model=MODEL_NAME,
        max_tokens=4096,
        tools=tools,
        tool_choice={"type": "any"},
        messages=messages,
    )
    if response.stop_reason == "tool_use":
        last_content_block = response.content[-1]
        if last_content_block.type == "tool_use":
            tool_name = last_content_block.name
            tool_inputs = last_content_block.input
            print(f"=======Claude Wants To Call The {tool_name} Tool=======")
            if tool_name == "send_text_to_user":
                send_text_to_user(tool_inputs["text"])
            elif tool_name == "get_customer_info":
                print(get_customer_info(tool_inputs["username"]))
            else:
                print("Oh dear, that tool doesn't exist!")

    else:
        print("No tool was called. This shouldn't happen!")

```

Let's start simple:

```python

sms_chatbot("Hey there! How are you?")

```

Claude responds back by calling the `send_text_to_user` tool.

Next, we'll ask Claude something a bit trickier:

```python

sms_chatbot("I need help looking up an order")

```

Claude wants to send a text message, asking a user to provide their username.

Now, let's see what happens when we provide Claude with our username:

```python

sms_chatbot("I need help looking up an order.  My username is jenny76")

```

Claude calls the `get_customer_info` tool, just as we hoped! 

Even if we send Claude a gibberish message, it will still call one of our tools:

```python

sms_chatbot("askdj aksjdh asjkdbhas kjdhas 1+1 ajsdh")

```



---

## extracting_structured_json

# Extracting Structured JSON using Claude and Tool Use

In this cookbook, we'll explore various examples of using Claude and the tool use feature to extract structured JSON data from different types of input. We'll define custom tools that prompt Claude to generate well-structured JSON output for tasks such as summarization, entity extraction, sentiment analysis, and more.

If you want to get structured JSON data without using tools, take a look at our "[How to enable JSON mode](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb)" cookbook.

## Set up the environment

First, let's install the required libraries and set up the Claude API client.

```python

%pip install anthropic requests beautifulsoup4

```

```python

import json

import requests
from anthropic import Anthropic
from bs4 import BeautifulSoup

client = Anthropic()
MODEL_NAME = "claude-haiku-4-5"

```

## Example 1: Article Summarization

In this example, we'll use Claude to generate a JSON summary of an article, including fields for the author, topics, summary, coherence score, persuasion score, and a counterpoint.

```python

tools = [
    {
        "name": "print_summary",
        "description": "Prints a summary of the article.",
        "input_schema": {
            "type": "object",
            "properties": {
                "author": {"type": "string", "description": "Name of the article author"},
                "topics": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": 'Array of topics, e.g. ["tech", "politics"]. Should be as specific as possible, and can overlap.',
                },
                "summary": {
                    "type": "string",
                    "description": "Summary of the article. One or two paragraphs max.",
                },
                "coherence": {
                    "type": "integer",
                    "description": "Coherence of the article's key points, 0-100 (inclusive)",
                },
                "persuasion": {
                    "type": "number",
                    "description": "Article's persuasion score, 0.0-1.0 (inclusive)",
                },
            },
            "required": ["author", "topics", "summary", "coherence", "persuasion", "counterpoint"],
        },
    }
]

url = "https://www.anthropic.com/news/third-party-testing"
response = requests.get(url, timeout=30)
soup = BeautifulSoup(response.text, "html.parser")
article = " ".join([p.text for p in soup.find_all("p")])

query = f"""
<article>
{article}
</article>

Use the `print_summary` tool.
"""

response = client.messages.create(
    model=MODEL_NAME, max_tokens=4096, tools=tools, messages=[{"role": "user", "content": query}]
)
json_summary = None
for content in response.content:
    if content.type == "tool_use" and content.name == "print_summary":
        json_summary = content.input
        break

if json_summary:
    print("JSON Summary:")
    print(json.dumps(json_summary, indent=2))
else:
    print("No JSON summary found in the response.")

```

## Example 2: Named Entity Recognition
In this example, we'll use Claude to perform named entity recognition on a given text and return the entities in a structured JSON format.

```python

tools = [
    {
        "name": "print_entities",
        "description": "Prints extract named entities.",
        "input_schema": {
            "type": "object",
            "properties": {
                "entities": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "The extracted entity name."},
                            "type": {
                                "type": "string",
                                "description": "The entity type (e.g., PERSON, ORGANIZATION, LOCATION).",
                            },
                            "context": {
                                "type": "string",
                                "description": "The context in which the entity appears in the text.",
                            },
                        },
                        "required": ["name", "type", "context"],
                    },
                }
            },
            "required": ["entities"],
        },
    }
]

text = "John works at Google in New York. He met with Sarah, the CEO of Acme Inc., last week in San Francisco."

query = f"""
<document>
{text}
</document>

Use the print_entities tool.
"""

response = client.messages.create(
    model=MODEL_NAME, max_tokens=4096, tools=tools, messages=[{"role": "user", "content": query}]
)

json_entities = None
for content in response.content:
    if content.type == "tool_use" and content.name == "print_entities":
        json_entities = content.input
        break

if json_entities:
    print("Extracted Entities (JSON):")
    print(json_entities)
else:
    print("No entities found in the response.")

```

## Example 3: Sentiment Analysis
In this example, we'll use Claude to perform sentiment analysis on a given text and return the sentiment scores in a structured JSON format.

```python

tools = [
    {
        "name": "print_sentiment_scores",
        "description": "Prints the sentiment scores of a given text.",
        "input_schema": {
            "type": "object",
            "properties": {
                "positive_score": {
                    "type": "number",
                    "description": "The positive sentiment score, ranging from 0.0 to 1.0.",
                },
                "negative_score": {
                    "type": "number",
                    "description": "The negative sentiment score, ranging from 0.0 to 1.0.",
                },
                "neutral_score": {
                    "type": "number",
                    "description": "The neutral sentiment score, ranging from 0.0 to 1.0.",
                },
            },
            "required": ["positive_score", "negative_score", "neutral_score"],
        },
    }
]

text = "The product was okay, but the customer service was terrible. I probably won't buy from them again."

query = f"""
<text>
{text}
</text>

Use the print_sentiment_scores tool.
"""

response = client.messages.create(
    model=MODEL_NAME, max_tokens=4096, tools=tools, messages=[{"role": "user", "content": query}]
)

json_sentiment = None
for content in response.content:
    if content.type == "tool_use" and content.name == "print_sentiment_scores":
        json_sentiment = content.input
        break

if json_sentiment:
    print("Sentiment Analysis (JSON):")
    print(json.dumps(json_sentiment, indent=2))
else:
    print("No sentiment analysis found in the response.")

```

## Example 4: Text Classification
In this example, we'll use Claude to classify a given text into predefined categories and return the classification results in a structured JSON format.

```python

tools = [
    {
        "name": "print_classification",
        "description": "Prints the classification results.",
        "input_schema": {
            "type": "object",
            "properties": {
                "categories": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "description": "The category name."},
                            "score": {
                                "type": "number",
                                "description": "The classification score for the category, ranging from 0.0 to 1.0.",
                            },
                        },
                        "required": ["name", "score"],
                    },
                }
            },
            "required": ["categories"],
        },
    }
]

text = "The new quantum computing breakthrough could revolutionize the tech industry."

query = f"""
<document>
{text}
</document>

Use the print_classification tool. The categories can be Politics, Sports, Technology, Entertainment, Business.
"""

response = client.messages.create(
    model=MODEL_NAME, max_tokens=4096, tools=tools, messages=[{"role": "user", "content": query}]
)

json_classification = None
for content in response.content:
    if content.type == "tool_use" and content.name == "print_classification":
        json_classification = content.input
        break

if json_classification:
    print("Text Classification (JSON):")
    print(json.dumps(json_classification, indent=2))
else:
    print("No text classification found in the response.")

```

## Example 5: Working with unknown keys

In some cases you may not know the exact JSON object shape up front. In this example we provide an open ended `input_schema` and instruct Claude via prompting how to interact with the tool.

```python

tools = [
    {
        "name": "print_all_characteristics",
        "description": "Prints all characteristics which are provided.",
        "input_schema": {"type": "object", "additionalProperties": True},
    }
]

query = """Given a description of a character, your task is to extract all the characteristics of the character and print them using the print_all_characteristics tool.

The print_all_characteristics tool takes an arbitrary number of inputs where the key is the characteristic name and the value is the characteristic value (age: 28 or eye_color: green).

<description>
The man is tall, with a beard and a scar on his left cheek. He has a deep voice and wears a black leather jacket.
</description>

Now use the print_all_characteristics tool."""

response = client.messages.create(
    model=MODEL_NAME,
    max_tokens=4096,
    tools=tools,
    tool_choice={"type": "tool", "name": "print_all_characteristics"},
    messages=[{"role": "user", "content": query}],
)

tool_output = None
for content in response.content:
    if content.type == "tool_use" and content.name == "print_all_characteristics":
        tool_output = content.input
        break

if tool_output:
    print("Characteristics (JSON):")
    print(json.dumps(json_classification, indent=2))
else:
    print("Something went wrong.")

```

These examples demonstrate how you can use Claude and the tool use feature to extract structured JSON data for various natural language processing tasks. By defining custom tools with specific input schemas, you can guide Claude to generate well-structured JSON output that can be easily parsed and utilized in your applications.



---

## vision_with_tools

# Using Vision with Tools

In this recipe, we'll demonstrate how to combine Vision with tool use to analyze an image of a nutrition label and extract structured nutrition information using a custom tool.

## Setup
First, let's install the necessary libraries and set up the Claude API client:

```python

%pip install anthropic IPython

```

```python

import base64

from anthropic import Anthropic
from IPython.display import Image

client = Anthropic()
MODEL_NAME = "claude-opus-4-1"

```

# Defining the Nutrition Label Extraction Tool
Next, we'll define a custom tool called "print_nutrition_info" that extracts structured nutrition information from an image. The tool has properties for calories, total fat, cholesterol, total carbs, and protein:

```python

nutrition_tool = {
    "name": "print_nutrition_info",
    "description": "Extracts nutrition information from an image of a nutrition label",
    "input_schema": {
        "type": "object",
        "properties": {
            "calories": {"type": "integer", "description": "The number of calories per serving"},
            "total_fat": {
                "type": "integer",
                "description": "The amount of total fat in grams per serving",
            },
            "cholesterol": {
                "type": "integer",
                "description": "The amount of cholesterol in milligrams per serving",
            },
            "total_carbs": {
                "type": "integer",
                "description": "The amount of total carbohydrates in grams per serving",
            },
            "protein": {
                "type": "integer",
                "description": "The amount of protein in grams per serving",
            },
        },
        "required": ["calories", "total_fat", "cholesterol", "total_carbs", "protein"],
    },
}

```

## Analyzing the Nutrition Label Image
Now, let's put it all together. We'll load a nutrition label image, pass it to Claude along with a prompt, and have Claude call the "print_nutrition_info" tool to extract the structured nutrition information into a nicely formatted JSON object:

```python

Image(filename="../images/tool_use/nutrition_label.png")

```

```python

def get_base64_encoded_image(image_path):
    with open(image_path, "rb") as image_file:
        binary_data = image_file.read()
        base_64_encoded_data = base64.b64encode(binary_data)
        base64_string = base_64_encoded_data.decode("utf-8")
        return base64_string


message_list = [
    {
        "role": "user",
        "content": [
            {
                "type": "image",
                "source": {
                    "type": "base64",
                    "media_type": "image/png",
                    "data": get_base64_encoded_image("../images/tool_use/nutrition_label.png"),
                },
            },
            {
                "type": "text",
                "text": "Please print the nutrition information from this nutrition label image.",
            },
        ],
    }
]

response = client.messages.create(
    model=MODEL_NAME, max_tokens=4096, messages=message_list, tools=[nutrition_tool]
)

if response.stop_reason == "tool_use":
    last_content_block = response.content[-1]
    if last_content_block.type == "tool_use":
        tool_name = last_content_block.name
        tool_inputs = last_content_block.input
        print(f"=======Claude Wants To Call The {tool_name} Tool=======")
        print(tool_inputs)

else:
    print("No tool was called. This shouldn't happen!")

```

