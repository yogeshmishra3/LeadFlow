import React, { useState, useEffect } from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFDownloadLink,
  Image, // Imported Image component
} from "@react-pdf/renderer";
import { useLocation } from "react-router-dom"; // To access the passed state from the Deals component
import "./Quotes.css";

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  companyInfo: {
    textAlign: "right",
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    color: "#0047AB",
    fontWeight: "bold",
  },
  details: {
    marginBottom: 20,
  },
  clientInfo: {
    marginBottom: 10,
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#0047AB",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ddd",
    padding: 5,
  },
  tableHeader: {
    fontWeight: "bold",
    color: "#0047AB",
  },
  footer: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 10,
    color: "#555",
  },
});

// PDF Document Component
const QuotationDocument = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        {/* Added Image */}
        <Image
          src="../TARS.png" // Replace with your logo's path
          style={{ width: 100, height: 40 }}
        />
        <View style={styles.companyInfo}>
          <Text style={styles.title}>QUOTATION</Text>
          <Text>Gotmare Complex, WHC Road</Text>
          <Text>Dharampeth, Nagpur - 440010</Text>
          <Text>info@tarstechnologies.com</Text>
          <Text>911 211 7415 | 902 838 9399</Text>
        </View>
      </View>

      {/* Quotation Details */}
      <View style={styles.details}>
        <Text>{data.CompanyRequirement}</Text>
        <Text>Quotation No: {data.quotationNo}</Text>
        <Text>Date: {data.date}</Text>
      </View>

      {/* Client Info */}
      <View style={styles.clientInfo}>
        <Text>Billed To:</Text>
        <Text>{data.clientName}</Text>
        <Text>{data.department}</Text>
      </View>

      {/* Items Table */}
      <View style={styles.table}>
        <View style={[styles.tableRow, { backgroundColor: "#f3f3f3" }]}>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Description</Text>
          <Text style={[styles.tableHeader, { flex: 1 }]}>Amount</Text>
        </View>
        {data.items.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={{ flex: 1 }}>{item.description}</Text>
            <Text style={{ flex: 1 }}>{item.amount}</Text>
          </View>
        ))}
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        Reach out to tars.co.in or +91-9112117415
      </Text>
    </Page>
  </Document>
);

// Quotation Generator Component
const QuotationGenerator = () => {
  const { state } = useLocation(); // To access the passed data from Deals component
  const { clientName, dealName } = state?.dealData || {}; // Extract clientName and dealName

  const [formData, setFormData] = useState({
    CompanyRequirement: "",
    quotationNo: "",
    date: "",
    clientName: clientName || "", // Pre-fill clientName from the passed data
    dealName: dealName || "",     // Pre-fill dealName from the passed data
    department: "",
    items: [],
  });

  const [currentItem, setCurrentItem] = useState({ description: "", amount: "" });
  const [savedQuotations, setSavedQuotations] = useState([]);

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Add item to the quotation
  const handleAddItem = () => {
    if (currentItem.description && currentItem.amount >= 1) {
      setFormData((prevData) => ({
        ...prevData,
        items: [...prevData.items, currentItem],
      }));
      setCurrentItem({ description: "", amount: "" });
    } else {
      alert("Please enter valid item details.");
    }
  };

  // Save quotation to the backend
  const handleSaveQuotation = async () => {
    // Validation for required fields
    const { CompanyRequirement, quotationNo, date, clientName, department, items } = formData;

    if (!quotationNo || !CompanyRequirement || !date || !clientName || !department) {
      alert("Please fill out all required fields.");
      return;
    }

    if (items.length === 0) {
      alert("Please add at least one item with a description and amount.");
      return;
    }

    try {
      const response = await fetch("https://crm-mu-sooty.vercel.app/api/newquotations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    });
    

      if (!response.ok) throw new Error("Failed to save quotation");

      const savedQuotation = await response.json();
      setSavedQuotations((prevQuotations) => [...prevQuotations, savedQuotation]);
      alert("Quotation saved successfully!");

      // Reset form after successful submission
      setFormData({
        CompanyRequirement: "",
        quotationNo: "",
        date: "",
        clientName: clientName || "", // Keep clientName pre-filled
        dealName: dealName || "",     // Keep dealName pre-filled
        department: "",
        items: [],
      });
    } catch (error) {
      alert("Error saving quotation: " + error.message);
    }
  };

  // Fetch saved quotations
  useEffect(() => {
    const fetchQuotations = async () => {
      try {
        const response = await fetch("https://crm-mu-sooty.vercel.app/api/newquotations");
        const data = await response.json();
        setSavedQuotations(data);
      } catch (error) {
        console.error("Error fetching quotations:", error);
      }
    };
    fetchQuotations();
  }, []);

  return (
    <div className="quotes-container">
      <form className="quotes-form">
        <h2>Quotation Generator</h2>

        {/* Quotation Details */}
        <label>Quotation No:</label>
        <input
          type="text"
          name="quotationNo"
          value={formData.quotationNo}
          onChange={handleInputChange}
          required
        />
        <label>Company Requirement:</label>
        <input
          type="text"
          name="CompanyRequirement"
          value={formData.CompanyRequirement}
          onChange={handleInputChange}
          required
        />
        <label>Date:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          required
        />

        {/* Client Info - Uneditable */}
        <label>Client Name:</label>
        <input
          type="text"
          name="clientName"
          value={formData.clientName}
          disabled
        />
        <label>Deal Name:</label>
        <input
          type="text"
          name="dealName"
          value={formData.dealName}
          disabled
        />

        <label>Department:</label>
        <input
          type="text"
          name="department"
          value={formData.department}
          onChange={handleInputChange}
          required
        />

        {/* Items Section */}
        <div className="add-item-section">
          <label>Description:</label>
          <input
            type="text"
            value={currentItem.description}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, description: e.target.value })
            }
          />
          <label>Amount:</label>
          <input
            type="number"
            value={currentItem.amount}
            onChange={(e) =>
              setCurrentItem({ ...currentItem, amount: e.target.value })
            }
          />
          <button type="button" onClick={handleAddItem}>
            Add Item
          </button>
        </div>

        {/* Items List */}
        <div className="items-list">
          <ul>
            {formData.items.map((item, index) => (
              <li key={index}>
                {item.description} - ₹{item.amount}
              </li>
            ))}
          </ul>
        </div>

        <button type="button" onClick={handleSaveQuotation}>
          Save Quotation
        </button>
      </form>

      {/* Saved Quotations */}
<div className="saved-quotations">
<h3>Saved Quotations</h3>
<table style={{ width: "100%" }}>
  <thead>
    <tr>
      <th>Client Name</th>
      <th>Quotation No</th>
      <th>Date</th>
      <th>Actions</th>
    </tr>
  </thead>
  <tbody>
  {savedQuotations.map((quotation, index) => (
  <tr key={index}>
    <td>{quotation.clientName}</td>
    <td>{quotation.quotationNo}</td>
    <td>{quotation.date}</td>
    <td>{quotation.dealName}</td> {/* Display the deal name here */}
    <td>
      <PDFDownloadLink
        document={<QuotationDocument data={quotation} />}
        fileName={`quotation_${quotation.quotationNo}.pdf`}
      >
        {({ loading }) => loading ? "Loading PDF..." : "Download PDF"}
      </PDFDownloadLink>
    </td>
  </tr>
))}

  </tbody>
</table>
</div>
    </div>
  );
};

export default QuotationGenerator;

