import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import InboxSection from './EmailComponent/InboxSection';
import SentSection from './EmailComponent/SentSection';
import Drafts from './EmailComponent/DraftSection';
import './email.css';

const EmailManagement = () => {
    const [emails, setEmails] = useState([]); // Inbox emails
    const [sentEmails, setSentEmails] = useState([]); // Sent emails
    const [drafts, setDrafts] = useState([]); // Draft emails
    const [activeTab, setActiveTab] = useState('inbox'); // Track active tab
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch emails based on activeTab
    useEffect(() => {
        const fetchEmails = async () => {
            setLoading(true);
            setError(null);

            let url = '';
            if (activeTab === 'inbox') {
                url = 'http://localhost:5002/fetch-inbox-emails';
            } else if (activeTab === 'sent') {
                url = 'http://localhost:5002/fetch-sent-emails';
            } else if (activeTab === 'drafts') {
                url = 'http://localhost:5002/fetch-drafts';
            }

            try {
                const res = await fetch(url);
                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || 'Failed to fetch data');
                }

                if (activeTab === 'inbox') {
                    setEmails(data.emails || []);
                } else if (activeTab === 'sent') {
                    setSentEmails(data.emails || []);
                } else if (activeTab === 'drafts') {
                    setDrafts(data || []);
                }
            } catch (err) {
                console.error(`Error fetching ${activeTab} emails:, err`);
                setError(`Failed to fetch ${activeTab} emails`);
            } finally {
                setLoading(false);
            }
        };

        fetchEmails();
    }, [activeTab]);

    // Handle folder tab click
    const handleTabClick = (tab) => {
        setActiveTab(tab);
        setError(null); // Clear errors when switching tabs
    };

    // Navigate to compose email page
    const handleComposeClick = () => {
        navigate('/send-email');
    };

    return (
        <div className="email-app" style={{ marginLeft: '15%' }}>
            {/* Sidebar */}
            <aside className="email-sidebar">
                <button className="compose-button" onClick={handleComposeClick}>
                    Compose +
                </button>
                <button onClick={() => handleTabClick('inbox')}>Inbox</button>
                <button onClick={() => handleTabClick('sent')}>Sent</button>
                <button onClick={() => handleTabClick('drafts')}>Drafts</button>
            </aside>

            {/* Main Content */}
            <main className="email-main">
                <h1>
                    {activeTab === 'inbox'
                        ? 'Inbox'
                        : activeTab === 'sent'
                            ? 'Sent Emails'
                            : 'Draft Emails'}
                </h1>

                {loading ? (
                    <p>Loading...</p>
                ) : error ? (
                    <p style={{ color: 'red' }}>{error}</p>
                ) : activeTab === 'inbox' ? (
                    <InboxSection emails={emails} />
                ) : activeTab === 'sent' ? (
                    <SentSection emails={sentEmails} />
                ) : (
                    <Drafts drafts={drafts} />
                )}
            </main>
        </div>
    );
};

export default EmailManagement;