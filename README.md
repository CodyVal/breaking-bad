# Breaking Bad

## What Does the App Do?

This application takes in **release notes** and **changelogs** from GitHub repositories, processes the Markdown content, and generates **embeddings** for each chunk of the parsed text. These embeddings can be used for various purposes, such as:

- **Semantic search** (finding similar release notes or changelogs)
- **Text clustering**
- **Content recommendation**

The application uses the following steps:

1. **Fetches release notes or changelogs** (in `.md` format) from GitHub.
2. **Parses the Markdown content** into plain text.
3. **Chunks the text** into manageable pieces based on token limits.
4. **Generates embeddings** for each chunk using a language model.
5. **Stores the embeddings** in a Supabase database for further analysis or search purposes.

## Features

- **Automatic parsing** of GitHub Markdown files.
- **Token-based chunking** to handle large documents.
- **Embedding generation** for text using OpenAI or other models.
- **Supabase integration** for storing and managing embeddings.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:

- [Node.js](https://nodejs.org/) (v14+)
- [pnpm](https://pnpm.io/) (for package management)
- [Supabase](https://supabase.io/) account (for storing embeddings)
- You will need to create a `Github App` for the authentication and API calls
- [GITHUB_CLIENT_ID](https://github.com)
- [GITHUB_CLIENT_SECRET](https://github.com)
- [OpenAI API Key](https://beta.openai.com/signup/) (if you're using OpenAI models for embedding generation)
- [Trigger.dev](https://trigger.dev/docs/introduction) account (for running the triggers and scheduled triggers)

## Setup and Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/@codyval/breaking-bad.git
   cd breaking-bad
   ```

2. **Create a Github App:**

   - Create an app within your github account
   - Generate a client secret
   - Generate a private key
   - Install the app into your account to get the installation id

3. **Update all the secrets:**
   You will find a `.env.example` file in each package/app that requires secrets:

   - (root)/ -> `.env`
   - /app/web -> `.env.local`
   - /packages/triggers -> `.env`

4. **Start the application:**

   ```
     pnpm i
     pnpm run dev
   ```
