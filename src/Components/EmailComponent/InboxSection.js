import React from 'react';



const InboxSection = ({ emails }) => {

    return (

        <section className="email-list">

            {emails.length > 0 ? (

                emails.map((email, index) => (

                    <div key={index} className="email-item inbox-item">

                        <div className="email-details">

                            <strong>{email.from}</strong>

                            <p>{email.subject}</p>

                            <span>{new Date(email.date).toLocaleString()}</span>

                        </div>

                    </div>

                ))

            ) : (

                <p className="no-emails-message">No emails found in Inbox.</p>

            )}

        </section>

    );

};



export default InboxSection;