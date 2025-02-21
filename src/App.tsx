import { useState } from "react";
import React from "react";
import { Groq } from "groq-sdk";
import "./App.css";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const MILLIS_TO_WAIT = 500;

function App() {
  const [userText, setUserText] = useState("");
  const [completionText, setCompletionText] = useState("");

  const typingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleKeyDown = (event: any) => {
    if (event.key === "Tab") {
      setUserText(userText + completionText);
      setCompletionText("");
      event.preventDefault();
    }
    if (event.key === "Escape") {
      setCompletionText("");
    }
    if (event.key === "Backspace") {
      setCompletionText("");
    }
  };

  const handleChange = (event: any) => {
    setUserText(event.target.value);
    setCompletionText("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      getCompletion(event.target.value);
    }, MILLIS_TO_WAIT);
  };

  const getCompletion = async (text: string) => {
    if (text.length < 4) return;
    const chatCompletion = await getGroqChatCompletion(text);
    setCompletionText(chatCompletion.choices[0]?.message?.content || "");
  };

  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      <textarea
        className="backdrop"
        value={userText + completionText}
        placeholder="Type here..."
        style={{
          whiteSpace: "pre-wrap",
          width: "450px",
          height: "250px",
          fontSize: "18px",
          color: "gray",
        }}
        spellCheck={false}
      />
      <textarea
        className="main"
        value={userText}
        onChange={handleChange}
        placeholder="Type here..."
        style={{
          whiteSpace: "pre-wrap",
          width: "450px",
          height: "250px",
          fontSize: "18px",
        }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />
      <div></div>
    </div>
  );
}

export async function getGroqChatCompletion(userText: string) {
  return groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are an AI text completion assistant designed to predict and provide text completions based on the user's current input, similar to GitHub Copilot. Your role focuses solely on extending the text without offering explanations, justifications, or additional context. Always return text that directly completes the user's input without including greetings, summaries, explanations, or commentary. Use the preceding text to maintain coherence, style, tone, and format, adapting to technical, formal, casual, or creative writing as required. Provide concise, relevant continuations that naturally flow from the given context, avoiding redundancy and ensuring accuracy, especially for technical or factual content. If the input ends mid-sentence, continue it logically; if it's a single word or fragment, predict plausible next words. Maintain proper syntax, indentation, and language-specific conventions for code completions, and continue sequences consistently in lists, bullet points, dialogues, or mathematical/logical expressions. Do not ask questions, include meta-comments, generate unrelated content, or offer multiple options. For example, completing 'The quick brown fox jumps over the' with ' lazy dog,' 'public static void main(String[] args) {' with '\n    System.out.println('Hello, World!');\n},' and '- Apples\n- Bananas\n-' with ' Cherries.' Do not add any formatting to your response based on language, just give the tokens as pure text. Your answers should not include extra parentheses if the user has already typed some, just complete what they've typed. If the user's text doesn't end with a space, add one to maintain proper formatting. ALWAYS answer with line breaks or indentation spaces to keep formatting when necessary. Adhere strictly to these instructions to maintain consistency, relevance, and usefulness as a text completion assistant.`,
      },
      {
        role: "user",
        content: userText,
      },
    ],
    model: "llama-3.1-8b-instant",
  });
}

export default App;
