---
layout: default
title: Support
---

# Support

<style>
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
    color: #e2e8f0;
    line-height: 1.6;
    min-height: 100vh;
  }

  .container {
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  }

  .header {
    text-align: center;
    margin-bottom: 40px;
    padding-top: 40px;
  }

  .header h1 {
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .header p {
    font-size: 16px;
    color: #94a3b8;
  }

  .content {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(0, 212, 255, 0.1);
    border-radius: 16px;
    padding: 32px 24px;
    margin-bottom: 24px;
    backdrop-filter: blur(10px);
  }

  .content h2 {
    font-size: 20px;
    margin-bottom: 16px;
    color: #00d4ff;
  }

  .content p {
    font-size: 15px;
    color: #cbd5e1;
    margin-bottom: 12px;
  }

  .disclaimer {
    background: rgba(239, 68, 68, 0.05);
    border-left: 4px solid #ef4444;
    padding: 16px;
    border-radius: 8px;
    margin-top: 20px;
  }

  .disclaimer p {
    font-size: 14px;
    color: #fca5a5;
  }

  .button-container {
    text-align: center;
    margin-top: 32px;
  }

  .email-button {
    display: inline-block;
    padding: 14px 32px;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    color: #0f172a;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 212, 255, 0.3);
  }

  .email-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 212, 255, 0.4);
  }

  .email-button:active {
    transform: translateY(0);
  }

  .footer {
    text-align: center;
    margin-top: 40px;
    padding-bottom: 40px;
    font-size: 13px;
    color: #64748b;
  }

  .footer a {
    color: #00d4ff;
    text-decoration: none;
  }

  .footer a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .container {
      padding: 16px;
    }

    .header {
      padding-top: 24px;
      margin-bottom: 24px;
    }

    .header h1 {
      font-size: 24px;
    }

    .content {
      padding: 20px 16px;
    }

    .content h2 {
      font-size: 18px;
    }

    .content p {
      font-size: 14px;
    }

    .email-button {
      padding: 12px 24px;
      font-size: 14px;
      width: 100%;
    }
  }
</style>

<div class="container">
  <div class="header">
    <h1>Support</h1>
    <p>We're here to help</p>
  </div>

  <div class="content">
    <h2>About This App</h2>
    <p>
      <strong>AI Personality Analyzer</strong> is an entertainment app that combines input information with AI models to generate personality analysis reports.
    </p>
    <p style="margin-top: 12px;">
      <strong>Important Disclaimer:</strong> This app is designed for entertainment purposes only. It does not provide real psychological analysis or professional personality assessment. The results are generated based on user input and AI model inference, and should not be considered as actual personality analysis or professional advice.
    </p>
    
    <div class="disclaimer">
      <p>
        ⚠️ <strong>Entertainment Only:</strong> This app generates fictional personality reports for fun. It is not a substitute for professional psychological evaluation or therapy.
      </p>
    </div>
  </div>

  <div class="button-container">
    <a href="mailto:support@example.com" class="email-button">Send us an Email</a>
  </div>

  <div class="footer">
    <p>
      <a href="./privacy-policy">Privacy Policy</a> • 
      <a href="https://github.com/OwenZhao9/ai-personality-analyzer">GitHub</a>
    </p>
    <p style="margin-top: 12px;">
      © 2026 AI Personality Analyzer. All rights reserved.
    </p>
  </div>
</div>
