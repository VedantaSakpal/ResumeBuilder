/* ============================================================
   RESUMEFORGE - AI RESUME ASSISTANT (chatbot.js)
   Powered by Google Gemini API
   ============================================================ */

(function () {
  "use strict";

  /* Configuration */
  var GEMINI_API_KEY     = "AIzaSyA3G26QZsZFjBWpc270Y0WA5D3b4N_mFTY";
  /* Preferred model: gemini-2.5-flash-lite (fast, free-tier quota available).
     Fallback: gemini-2.5-flash (heavier but also works with this key).        */
  var GEMINI_MODEL       = "gemini-2.5-flash-lite";
  var GEMINI_MODEL_FALLBACK = "gemini-2.5-flash";
  var GEMINI_BASE        = "https://generativelanguage.googleapis.com/v1beta/models/";

  function buildUrl(model) {
    return GEMINI_BASE + model + ":generateContent?key=" + GEMINI_API_KEY;
  }

  var SYSTEM_PROMPT =
    "You are ResumeForge AI, an expert resume writing assistant embedded inside the ResumeForge resume builder app.\n\n" +
    "Your expertise covers:\n" +
    "- Writing compelling professional summaries and objective statements\n" +
    "- Crafting powerful work experience bullet points using the STAR method\n" +
    "- Suggesting industry-relevant skills for any role or field\n" +
    "- Generating impactful project descriptions\n" +
    "- ATS optimization tips and keyword strategies\n" +
    "- Resume formatting and structure best practices\n" +
    "- Tailoring resumes for specific job descriptions\n\n" +
    "Guidelines:\n" +
    "- Keep responses concise, actionable, and easy to copy into the resume form\n" +
    "- Provide ready-to-use text when generating content\n" +
    "- Use bullet points for lists\n" +
    "- Be encouraging and professional\n" +
    "- If asked something unrelated to resume/career topics, gently redirect";

  var QUICK_PROMPTS = [
    { label: "Write summary",       text: "Write a professional summary for a software engineer with 3 years of experience." },
    { label: "Improve experience",  text: "Help me write stronger bullet points for a marketing manager role." },
    { label: "Suggest skills",      text: "What skills should I add for a data analyst role?" },
    { label: "Project description", text: "Write a project description for a web app I built using React and Node.js." },
    { label: "ATS tips",            text: "Give me tips to make my resume ATS-friendly." },
  ];

  /* State */
  var conversationHistory = [];
  var isStreaming = false;
  var isOpen      = false;

  /* DOM refs */
  var fab, chatWindow, messagesContainer, inputEl, sendBtn, clearBtn, quickPromptsEl;

  /* ============================================================
     HTML CREATION
  ============================================================ */
  function createChatbotHTML() {
    var fabEl = document.createElement("button");
    fabEl.id = "chatbot-fab";
    fabEl.className = "chatbot-fab";
    fabEl.setAttribute("aria-label", "Open AI Resume Assistant");
    fabEl.setAttribute("title", "AI Resume Assistant");
    fabEl.innerHTML =
      '<svg class="fab-icon-chat" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' +
      '<svg class="fab-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
      '<span class="fab-badge">AI</span>';

    var promptChips = QUICK_PROMPTS.map(function(p) {
      return '<button class="quick-prompt-chip" data-prompt="' + encodeURIComponent(p.text) + '">' + p.label + '</button>';
    }).join("");

    var winEl = document.createElement("div");
    winEl.id = "chatbot-window";
    winEl.className = "chatbot-window";
    winEl.setAttribute("role", "dialog");
    winEl.setAttribute("aria-label", "AI Resume Assistant");
    winEl.innerHTML =
      '<div class="chatbot-header">' +
        '<div class="chatbot-header-avatar">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>' +
        '</div>' +
        '<div class="chatbot-header-info">' +
          '<div class="chatbot-header-name">ResumeForge AI</div>' +
          '<div class="chatbot-header-status">Online &amp; ready to help</div>' +
        '</div>' +
        '<button class="chatbot-header-clear" id="chatbot-clear" title="Clear conversation" aria-label="Clear chat">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="chatbot-messages" id="chatbot-messages" role="log" aria-live="polite"></div>' +
      '<div class="chatbot-quick-prompts" id="chatbot-quick-prompts">' +
        '<span class="chatbot-quick-prompts-label">Quick prompts</span>' +
        promptChips +
      '</div>' +
      '<div class="chatbot-input-area">' +
        '<textarea id="chatbot-input" class="chatbot-input" placeholder="Ask me to write a summary, improve bullet points, suggest skills..." rows="1" aria-label="Type your message"></textarea>' +
        '<button class="chatbot-send-btn" id="chatbot-send" aria-label="Send message" disabled>' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>' +
        '</button>' +
      '</div>';

    document.body.appendChild(fabEl);
    document.body.appendChild(winEl);
    return { fab: fabEl, chatWindow: winEl };
  }

  /* ============================================================
     TOGGLE
  ============================================================ */
  function toggleChat() {
    isOpen = !isOpen;
    fab.classList.toggle("open", isOpen);
    chatWindow.classList.toggle("open", isOpen);
    if (isOpen) {
      var badge = fab.querySelector(".fab-badge");
      if (badge) badge.remove();
      inputEl.focus();
      scrollToBottom();
    }
  }

  /* ============================================================
     RENDERING
  ============================================================ */
  function scrollToBottom() {
    requestAnimationFrame(function () {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });
  }

  function appendMessage(role, text, opts) {
    opts = opts || {};
    var wrapper = document.createElement("div");
    wrapper.className = "chat-msg " + role;

    var avatar = document.createElement("div");
    avatar.className = "chat-msg-avatar";
    if (role === "bot") {
      avatar.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/></svg>';
    } else {
      avatar.textContent = "U";
    }

    var bubble = document.createElement("div");
    bubble.className = "chat-bubble" + (opts.error ? " error" : "");

    if (opts.typing) {
      wrapper.classList.add("typing");
      bubble.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
    } else {
      bubble.innerHTML = formatMessage(text);
    }

    wrapper.appendChild(avatar);
    wrapper.appendChild(bubble);
    messagesContainer.appendChild(wrapper);
    scrollToBottom();
    return { wrapper: wrapper, bubble: bubble };
  }

  function formatMessage(text) {
    if (!text) return "";
    var html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
    html = html.replace(/(^|\n)[*\-] (.+)/g, "$1<li>$2</li>");
    html = html.replace(/(^|\n)[.] (.+)/g, "$1<li>$2</li>");
    html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, function(m) { return "<ul>" + m + "</ul>"; });
    html = html.replace(/\n/g, "<br/>");
    return html;
  }

  function showTyping() {
    var r = appendMessage("bot", "", { typing: true });
    return function() { r.wrapper.remove(); };
  }

  function showWelcome() {
    appendMessage("bot",
      "**Hi! I am ResumeForge AI**, your personal resume assistant.\n\n" +
      "I can help you:\n" +
      "- Write compelling professional summaries\n" +
      "- Craft powerful work experience bullet points\n" +
      "- Suggest the right skills for any role\n" +
      "- Generate project descriptions\n" +
      "- Optimize for ATS systems\n\n" +
      "What would you like to improve today?"
    );
  }

  /* ============================================================
     GEMINI API - correct model, auto-fallback, real error surfacing
  ============================================================ */
  async function callGeminiModel(model, userMessage, isRetry) {
    var url = buildUrl(model);

    var payload = {
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: conversationHistory,
      generationConfig: {
        temperature: 0.75,
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.9
      }
    };

    console.log("[Chatbot] Request → model:", model, "| history turns:", conversationHistory.length);

    var res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (netErr) {
      throw new GeminiError("NETWORK", "Network error – check your internet connection. (" + netErr.message + ")", 0);
    }

    /* Always read the body so we capture the real Gemini error message */
    var bodyText = "";
    try { bodyText = await res.text(); } catch (_) {}
    var bodyJson = null;
    try { bodyJson = JSON.parse(bodyText); } catch (_) {}

    console.log("[Chatbot] Response ← HTTP", res.status, "model:", model);
    if (!res.ok) {
      console.error("[Chatbot] Error body:", bodyText.slice(0, 1000));
    }

    if (!res.ok) {
      var apiMsg =
        (bodyJson && bodyJson.error && bodyJson.error.message) ||
        ("HTTP " + res.status + ": " + bodyText.slice(0, 400));

      /* If the preferred model hit quota, silently retry on fallback once */
      if ((res.status === 429 || res.status === 404) && !isRetry && model === GEMINI_MODEL) {
        console.warn("[Chatbot] Primary model failed (" + res.status + "), retrying with fallback:", GEMINI_MODEL_FALLBACK);
        return callGeminiModel(GEMINI_MODEL_FALLBACK, userMessage, true);
      }

      throw new GeminiError(res.status, apiMsg, res.status);
    }

    var responseText =
      bodyJson &&
      bodyJson.candidates &&
      bodyJson.candidates[0] &&
      bodyJson.candidates[0].content &&
      bodyJson.candidates[0].content.parts &&
      bodyJson.candidates[0].content.parts[0] &&
      bodyJson.candidates[0].content.parts[0].text;

    if (!responseText) {
      var finishReason = bodyJson && bodyJson.candidates && bodyJson.candidates[0] && bodyJson.candidates[0].finishReason;
      console.warn("[Chatbot] Empty response. finishReason:", finishReason);
      responseText = finishReason === "SAFETY"
        ? "I couldn't generate a response for that request due to safety guidelines. Please try rephrasing."
        : "Sorry, I received an empty response. Please try again.";
    }

    conversationHistory.push({ role: "model", parts: [{ text: responseText }] });
    return responseText;
  }

  async function callGemini(userMessage) {
    /* Add user turn before the network call */
    conversationHistory.push({ role: "user", parts: [{ text: userMessage }] });
    return callGeminiModel(GEMINI_MODEL, userMessage, false);
  }

  function GeminiError(code, message, httpStatus) {
    this.name       = "GeminiError";
    this.code       = code;
    this.message    = message;
    this.httpStatus = httpStatus;
  }

  /* ============================================================
     SEND MESSAGE  -  single guard prevents duplicate requests
  ============================================================ */
  async function sendMessage(text) {
    var msg = (text !== undefined ? String(text) : inputEl.value).trim();
    if (!msg) return;

    /* Hard guard - do nothing if a request is already in flight */
    if (isStreaming) {
      console.log("[Chatbot] Request blocked - already processing previous message.");
      return;
    }

    /* Lock */
    isStreaming = true;
    sendBtn.disabled = true;
    inputEl.value = "";
    autoResizeInput();

    if (quickPromptsEl) quickPromptsEl.style.display = "none";

    appendMessage("user", msg);
    var removeTyping = showTyping();

    try {
      var reply = await callGemini(msg);
      removeTyping();
      appendMessage("bot", reply);
    } catch (err) {
      removeTyping();
      console.error("[Chatbot] Caught error:", err.name, err.code, err.httpStatus, err.message);

      var display;
      var status = err.httpStatus || 0;

      if (err.code === "NETWORK") {
        display = "⚠️ Network error – please check your connection and try again.";
      } else if (status === 400) {
        display = "⚠️ Bad request (400).\n\n" + err.message;
      } else if (status === 401 || status === 403) {
        display = "⚠️ API key invalid or unauthorized (" + status + ").\n\n" + err.message;
      } else if (status === 404) {
        display = "⚠️ Model not found (404). The model may not be available for your API key.\n\n" + err.message;
      } else if (status === 429) {
        display = "⚠️ Quota exhausted (429) – both models hit their rate limit.\n\n" + err.message;
      } else if (status >= 500) {
        display = "⚠️ Gemini server error (" + status + "). Please try again shortly.\n\n" + err.message;
      } else {
        display = "⚠️ " + (err.message || "Something went wrong. Please try again.");
      }

      appendMessage("bot", display, { error: true });

      /* Pop the failed user turn so it can be retried cleanly */
      if (conversationHistory.length > 0 &&
          conversationHistory[conversationHistory.length - 1].role === "user") {
        conversationHistory.pop();
      }
    } finally {
      isStreaming = false;
      updateSendBtn();
    }
  }

  /* ============================================================
     INPUT HELPERS
  ============================================================ */
  function autoResizeInput() {
    inputEl.style.height = "auto";
    inputEl.style.height = Math.min(inputEl.scrollHeight, 120) + "px";
  }

  function updateSendBtn() {
    sendBtn.disabled = !inputEl.value.trim() || isStreaming;
  }

  /* ============================================================
     CLEAR
  ============================================================ */
  function clearConversation() {
    conversationHistory = [];
    messagesContainer.innerHTML = "";
    if (quickPromptsEl) quickPromptsEl.style.display = "";
    showWelcome();
  }

  /* ============================================================
     EVENT BINDING
  ============================================================ */
  function bindEvents() {
    fab.addEventListener("click", toggleChat);

    sendBtn.addEventListener("click", function() { sendMessage(); });

    inputEl.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    inputEl.addEventListener("input", function() {
      autoResizeInput();
      updateSendBtn();
    });

    clearBtn.addEventListener("click", clearConversation);

    chatWindow.querySelectorAll(".quick-prompt-chip").forEach(function(chip) {
      chip.addEventListener("click", function() {
        sendMessage(decodeURIComponent(chip.dataset.prompt));
      });
    });

    document.addEventListener("keydown", function(e) {
      if (e.key === "Escape" && isOpen) toggleChat();
    });
  }

  /* ============================================================
     INIT
  ============================================================ */
  function init() {
    var els = createChatbotHTML();
    fab               = els.fab;
    chatWindow        = els.chatWindow;
    messagesContainer = document.getElementById("chatbot-messages");
    inputEl           = document.getElementById("chatbot-input");
    sendBtn           = document.getElementById("chatbot-send");
    clearBtn          = document.getElementById("chatbot-clear");
    quickPromptsEl    = document.getElementById("chatbot-quick-prompts");

    showWelcome();
    bindEvents();
    console.log("[Chatbot] Ready. Primary model:", GEMINI_MODEL, "| Fallback:", GEMINI_MODEL_FALLBACK);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();