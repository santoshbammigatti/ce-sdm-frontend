import { useState } from 'react';

export default function UserGuide() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        className="btn" 
        onClick={() => setIsOpen(true)} 
        style={{ 
          padding: '4px 8px', 
          fontSize: '12px',
          background: 'transparent',
          border: '1px solid var(--border)'
        }}
      >
        User Guide
      </button>
    );
  }

  return (
    <div className="modal-overlay" onClick={() => setIsOpen(false)}>
      <div className="modal-content user-guide-modal" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ margin: 0 }}>CE Summarizer - User Guide</h2>
          <button className="btn" onClick={() => setIsOpen(false)}>Close</button>
        </div>

        <div className="user-guide-content">
          <section>
            <h3>Overview</h3>
            <p>
              This is a Customer Support Email Summarization tool that helps agents quickly process customer email threads.
              It uses AI to generate draft summaries, which agents can review, edit, and approve before posting to the CRM system.
            </p>
          </section>

          <section>
            <h3>Workflow</h3>
            <ol>
              <li><strong>Select a Thread:</strong> Click on any email thread from the left sidebar</li>
              <li><strong>Review Messages:</strong> Read the customer email conversation in the middle panel</li>
              <li><strong>Generate Summary:</strong> Click "Generate Draft" to create an AI-powered summary</li>
              <li><strong>Edit & Refine:</strong> Review the summary, make edits, and update the status</li>
              <li><strong>Save Changes:</strong> Click "Save Edit" to store your modifications</li>
              <li><strong>Approve:</strong> Once satisfied, click "Approve" to finalize the summary</li>
              <li><strong>Post to CRM:</strong> Send the approved summary to the CRM system</li>
            </ol>
          </section>

          <section>
            <h3>Groq API Key</h3>
            <p><strong>With API Key:</strong></p>
            <ul>
              <li>Generate AI-powered summaries instantly</li>
              <li>Get intelligent issue type detection</li>
              <li>Receive recommended actions</li>
              <li>Free tier: 30 requests per minute</li>
            </ul>
            
            <p><strong>Without API Key:</strong></p>
            <ul>
              <li>Deterministic keyword matching fallback</li>
              <li>Basic summary generation available</li>
              <li>Can view and edit existing summaries</li>
            </ul>

            <p><strong>How to Get a Free API Key:</strong></p>
            <ol>
              <li>Visit <a href="https://console.groq.com/" target="_blank" rel="noopener noreferrer">https://console.groq.com/</a></li>
              <li>Sign up for a free account</li>
              <li>Navigate to API Keys section</li>
              <li>Create a new API key (starts with "gsk_")</li>
              <li>Paste it in the "Groq API Key" field in the toolbar</li>
            </ol>
          </section>

          <section>
            <h3>Features</h3>
            <ul>
              <li><strong>Theme Toggle:</strong> Switch between light and dark modes (top-right corner)</li>
              <li><strong>Reset Current:</strong> Clear the summary for the selected thread</li>
              <li><strong>Reset ALL:</strong> Clear all summaries and start fresh</li>
              <li><strong>CRM Context:</strong> View customer policy, order status, and stock availability</li>
              <li><strong>Loading Indicators:</strong> Visual feedback during operations</li>
            </ul>
          </section>

          <section>
            <h3>Tips</h3>
            <ul>
              <li>Summaries are saved automatically when you click "Save Edit"</li>
              <li>The "Current Status" field can be edited before saving</li>
              <li>Approved summaries cannot be edited (use reset to make changes)</li>
              <li>Your theme preference is saved in your browser</li>
              <li>All users share the same thread database</li>
            </ul>
          </section>

          <section>
            <h3>Summary States</h3>
            <div className="chip-group">
              <span className="chip">NONE</span> - No summary generated yet
            </div>
            <div className="chip-group">
              <span className="chip">DRAFT</span> - AI summary generated
            </div>
            <div className="chip-group">
              <span className="chip">EDITED</span> - Agent has modified the draft
            </div>
            <div className="chip-group">
              <span className="chip">APPROVED</span> - Final version, ready for CRM
            </div>
          </section>
        </div>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <button className="btn primary" onClick={() => setIsOpen(false)}>
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
