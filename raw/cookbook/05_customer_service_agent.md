# 05 Customer Service Agent

Source: 

# Creating a Customer Service Agent with Client-Side Tools

In this recipe, we'll demonstrate how to create a customer service chatbot using Claude 3 plus client-side tools. The chatbot will be able to look up customer information, retrieve order details, and cancel orders on behalf of the customer. We'll define the necessary tools and simulate synthetic responses to showcase the chatbot's capabilities.

## Step 1: Set up the environment

First, let's install the required libraries and set up the Claude API client.





## Step 2: Define the client-side tools

Next, we'll define the client-side tools that our chatbot will use to assist customers. We'll create three tools: get_customer_info, get_order_details, and cancel_order.



## Step 3: Simulate synthetic tool responses

Since we don't have real customer data or order information, we'll simulate synthetic responses for our tools. In a real-world scenario, these functions would interact with your actual customer database and order management system.



## Step 4: Process tool calls and return results

We'll create a function to process the tool calls made by Claude and return the appropriate results.



## Step 5: Interact with the chatbot

Now, let's create a function to interact with the chatbot. We'll send a user message, process any tool calls made by Claude, and return the final response to the user.



## Step 6: Test the chatbot
Let's test our customer service chatbot with a few sample queries.



And that's it! We've created a customer service chatbot using Claude 3 models and client-side tools. The chatbot can look up customer information, retrieve order details, and cancel orders based on the user's requests. By defining clear tool descriptions and schemas, we enable Claude to effectively understand and utilize the available tools to assist customers.

Feel free to expand on this example by integrating with your actual customer database and order management system, and by adding more tools to handle a wider range of customer service tasks.