# 04 Json Mode

Source: 

# Prompting Claude for "JSON Mode"

Claude doesn't have a formal "JSON Mode" with constrained sampling. But not to worry -- you can still get reliable JSON from Claude! This recipe will show you how.

First, let's look at Claude's default behavior.









Claude followed instructions and outputted a nice dictionary, which we can extract with code:



But what if we want Claude to skip the preamble and go straight to the JSON? One simple way is to prefill Claude's response and include a "{" character.



Now all we have to do is add back the "{" that we prefilled and we can extract the JSON.



For very long and complicated prompts, which contain multiple JSON outputs so that a string search for "{" and "}" don't do the trick, you can also have Claude output each JSON item in specified tags for future extraction.



Now, we can use an extraction regex to get all the dictionaries.







So to recap:

- You can use string parsing to extract the text between "```json" and "```" to get the JSON.
- You can remove preambles *before* the JSON via a partial Assistant message. (However, this removes the possibility of having Claude do "Chain of Thought" for increased intelligence before beginning to output the JSON.)
- You can get rid of text that comes *after* the JSON by using a stop sequence.
- You can instruct Claude to output JSON in XML tags to make it easy to collect afterward for more complex prompts.