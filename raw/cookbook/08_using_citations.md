# 08 Using Citations

Source: 

# Citations 

The Claude API features citation support that enables Claude to provide detailed citations when answering questions about documents. Citations are a valuable affordance in many LLM powered applications to help users track and verify the sources of information in responses.

Citations are supported on:
* `claude-sonnet-4-6`
* `claude-3-5-haiku-20241022`

The citations feature is an alternative to prompt-based citation techniques. Using this featue has the following advantages:
- Prompt-based techniques often require Claude to output full quotes from the source document it intends to cite. This increases output tokens and therefore cost.
- The citation feature will not return citations pointing to documents or locations that were not provided as valid sources.
- While testing we found the citation feature to generate citations with higher recall and percision than prompt based techniques.

The documentation for citations can be found [here](https://docs.claude.com/en/docs/build-with-claude/citations).

## Setup

First, let's install the required libraries and initalize our Anthropic client. 





## Document Types

Citations support three different document types. The type of citation outputted depends on the type of document being cited from:

* Plain text document citation → char location format
* PDF document citation → page location format
* Custom content document citation → content block location format

We will explore working with each of these in the examples below.

### Plain Text Documents

With plain text document citations you provide your document as raw text to the model. You can provide one or multiple documents. This text will get automatically chunked into sentences. The model will cite these sentences as appropriate. The model is able to cite multiple sentences together at once in a single citation but will not cite text smaller than a sentence.

Along with the outputted text the API response will include structured data for all citations. 

Let's see a complete example using a help center customer chatbot for a made up company PetWorld.



#### Visualizing Citations
By leveraging the citation data, we can create UIs that:

1. Show users exactly where information comes from
2. Link directly to source documents
3. Highlight cited text in context
4. Build trust through transparent sourcing

Below is a simple visualization function that transforms Claude's structured citations into a readable format with numbered references, similar to academic papers.

The function takes Claude's response object and outputs:
- Text with numbered citation markers (e.g., "The answer [1] includes this fact [2]")
- A numbered reference list showing each cited text and its source document



### PDF Documents

When working with PDFs, Claude can provide citations that reference specific page numbers, making it easy to track information sources. Here's how PDF citations work:

- PDF document content is provided as base64-encoded data
- Text is automatically chunked into sentences
- Citations include page numbers (1-indexed) where the information was found
- The model can cite multiple sentences together in a single citation but won't cite text smaller than a sentence
- While images are processed, only text content can be cited at this time

Below is an example using the Constitutional AI paper to demonstrate PDF citations:



### Custom Content Documents

While plain text documents are automatically chunked into sentences, custom content documents give you complete control over citation granularity. This API shape allows you to:

* Define your own chunks of any size
* Control the minimum citation unit
* Optimize for documents that don't work well with sentence chunking

In the example below, we use the same help center articles as the plain text example above, but instead of allowing sentence-level citations, we'll treat each article as a single chunk. This demonstrates how the choice of document type affects citation behavior and granularity. You will notice that the `cited_text` is the entire article in contrast to a sentence from the source article.



### Using the Context Field

The `context` field allows you to provide additional information about a document that Claude can use when generating responses, but that won't be cited. This is useful for:

* Providing metadata about the document (e.g., publication date, author)
* [Contextual retrieval](https://www.anthropic.com/news/contextual-retrieval)
* Including usage instructions or context that shouldn't be directly cited

In the example below, we provide a loyalty program article with a warning in the context field. Notice how Claude can use the information in the context to inform its response but the context field content is not available for citation.



### PDF Highlighting

One limitation with PDF citations is only the page numbers are returned. You can use third party libraries to match the returned cited text with page contents to draw attention to the cited content. This cell demonstrates PDF citation highlighting using Claude and PyMuPDF, creating a new annotated PDF:

