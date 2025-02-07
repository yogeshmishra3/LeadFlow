import { useState, useEffect } from "react";

const useEmployeeData = (apiUrl) => {
    const [employees, setEmployees] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    const fetchEmployees = async () => {
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.success) {
                setEmployees(data.employees);
                setFilteredEmployees(data.employees);
            } else {
                console.error("Failed to fetch employees!");
            }
        } catch (error) {
            console.error("Error fetching employees:", error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    return { employees, filteredEmployees, fetchEmployees, setFilteredEmployees };
};

export default useEmployeeData;