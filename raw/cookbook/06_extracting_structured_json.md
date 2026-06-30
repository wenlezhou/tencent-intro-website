# 06 Extracting Structured Json

Source: 

# Extracting Structured JSON using Claude and Tool Use

In this cookbook, we'll explore various examples of using Claude and the tool use feature to extract structured JSON data from different types of input. We'll define custom tools that prompt Claude to generate well-structured JSON output for tasks such as summarization, entity extraction, sentiment analysis, and more.

If you want to get structured JSON data without using tools, take a look at our "[How to enable JSON mode](https://github.com/anthropics/anthropic-cookbook/blob/main/misc/how_to_enable_json_mode.ipynb)" cookbook.

## Set up the environment

First, let's install the required libraries and set up the Claude API client.





## Example 1: Article Summarization

In this example, we'll use Claude to generate a JSON summary of an article, including fields for the author, topics, summary, coherence score, persuasion score, and a counterpoint.



## Example 2: Named Entity Recognition
In this example, we'll use Claude to perform named entity recognition on a given text and return the entities in a structured JSON format.



## Example 3: Sentiment Analysis
In this example, we'll use Claude to perform sentiment analysis on a given text and return the sentiment scores in a structured JSON format.



## Example 4: Text Classification
In this example, we'll use Claude to classify a given text into predefined categories and return the classification results in a structured JSON format.



## Example 5: Working with unknown keys

In some cases you may not know the exact JSON object shape up front. In this example we provide an open ended `input_schema` and instruct Claude via prompting how to interact with the tool.



These examples demonstrate how you can use Claude and the tool use feature to extract structured JSON data for various natural language processing tasks. By defining custom tools with specific input schemas, you can guide Claude to generate well-structured JSON output that can be easily parsed and utilized in your applications.