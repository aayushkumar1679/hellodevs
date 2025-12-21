import React from "react";

interface DataTableProps {
  id: string;
}

const DataTable: React.FC<DataTableProps> = ({ id }) => {
  const sampleData = [
    { name: "John", email: "john@example.com", role: "Admin" },
    { name: "Jane", email: "jane@example.com", role: "User" },
  ];

  return (
    <div id={id} className="w-full">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b">
            <th className="text-left p-2">Name</th>
            <th className="text-left p-2">Email</th>
            <th className="text-left p-2">Role</th>
          </tr>
        </thead>
        <tbody>
          {sampleData.map((row, i) => (
            <tr key={i} className="border-b">
              <td className="p-2">{row.name}</td>
              <td className="p-2">{row.email}</td>
              <td className="p-2">{row.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
