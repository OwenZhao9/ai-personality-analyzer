---
layout: default
title: Support
---

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
  </div>

  <div class="button-container">
    <a href="mailto:zhaoningup@gmail.com" class="email-button">Send us an Email</a>
  </div>
</div>
