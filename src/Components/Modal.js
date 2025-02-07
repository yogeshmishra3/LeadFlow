import React from 'react';
import './Modal.css';

const Modal = ({ organization, closeModal }) => {
  if (!organization) return null; // Don't render if no organization is provided.

  // Utility function to generate colors for the organization initials
  const getColor = (name) => {
    const colors = ["#CDE4FF", "#FFE4C7", "#FFD6E0", "#D4FFC1", "#E6D9FF"];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="modal-overlay" onClick={closeModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={closeModal}>
          &times;
        </button>
        <div className="modal-details">
          <div className='pi'>
          <div
            className="organization-initial"
            style={{
              backgroundColor: getColor(organization.name),
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              color: '#fff',
              fontSize: '24px',
              fontWeight: 'bold',
            }}
          >
            {organization.name.charAt(0).toUpperCase()}
          </div>
          <p><strong>{organization.name}</strong></p>
          </div>
          <p><strong>Type:</strong> {organization.type || 0}</p>
          <p><strong>Date:</strong> {organization.date || 0}</p>
          <p><strong>Customer:</strong> {organization.customer || 0}</p>
          <p><strong>Total:</strong> {organization.total || 0}</p>
          <p><strong>Balance:</strong> ${organization.balance ? organization.balance.toLocaleString() : "0.00"}</p>
          <p><strong>Status:</strong> {organization.status || "No description available."}</p>
        </div>
      </div>
    </div>
  );
};

export default Modal;
