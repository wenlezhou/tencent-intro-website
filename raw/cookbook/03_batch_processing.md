# 03 Batch Processing

Source: 

# Batch Processing with Message Batches API

Message Batches allow you to process large volumes of Messages requests asynchronously and cost-effectively. This cookbook demonstrates how to use the Message Batches API to handle bulk operations while reducing costs by 50%.

In this cookbook, we will demonstrate how to:

1. Create and submit message batches
2. Monitor batch processing status
3. Retrieve and handle batch results
4. Implement best practices for effective batching

## Setup

First, let's set up our environment with the necessary imports:





## Example 1: Basic Batch Processing

Let's start with a simple example that demonstrates creating and monitoring a batch of message requests.



# Monitoring Batch Progress

Now let's monitor the batch processing status:



# Retrieving Results

Once the batch is complete, we can retrieve and process the results:



## Example 2: Advanced Batch Processing for Different Message Types

This example demonstrates more advanced usage, including error handling and processing different types of requests in a single batch including a simple message, a message with a system prompt, a multi-turn message, and a message with an image. 



Great now let's view the results of the batch:

