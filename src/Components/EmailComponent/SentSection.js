import React from 'react';

const SentSection = ({ emails }) => {
    return (
        <section className="email-list">
            {emails.length > 0 ? (
                emails.map((email, index) => (
                    <div key={index} className="email-item sent-item">
                        <div className="email-details">
                            <strong>{email.to}</strong>
                            <p>{email.subject}</p>
                            <span>{new Date(email.date).toLocaleString()}</span>
                        </div>
                    </div>
                ))
            ) : (
                <p className="no-emails-message">No emails found in Sent folder.</p>
            )}
        </section>
    );
};

export default SentSection;