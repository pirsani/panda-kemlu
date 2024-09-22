"use client";
import { Button } from "@/components/ui/button";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Image from "next/image";
import React, { useRef } from "react";

const PayrollPDF = () => {
  const printRef = useRef<HTMLDivElement>(null);

  const generatePDF = async () => {
    if (!printRef.current) {
      return;
    }
    const doc = new jsPDF();

    // Capture the HTML content and convert it to canvas
    const canvas = await html2canvas(printRef.current);
    const imgData = canvas.toDataURL("/next.svg");
    const imgWidth = 190; // Image width
    const pageHeight = 295; // A4 page height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width; // Calculate image height
    let heightLeft = imgHeight;

    let position = 0;

    // Add the image to the PDF
    doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      doc.addPage();
      doc.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Save the PDF
    // doc.save("payroll.pdf");
    doc.output("dataurlnewwindow");
  };

  return (
    <div>
      <div
        // className="absolute bottom-[-1000px]"
        ref={printRef}
        style={{ padding: "20px", border: "1px solid black" }}
      >
        <h1 style={{ textAlign: "center" }}>Payroll Report</h1>
        <img src="/next.svg" alt="Logo" width={100} height={100} />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Employee Name
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Position
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Basic Salary
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Allowances
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Deductions
              </th>
              <th style={{ border: "1px solid black", padding: "8px" }}>
                Net Pay
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                John Doe
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                Manager
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $5000
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $500
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $200
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $5300
              </td>
            </tr>
            <tr>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                Jane Smith
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                Developer
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $4000
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $400
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $150
              </td>
              <td style={{ border: "1px solid black", padding: "8px" }}>
                $4250
              </td>
            </tr>
          </tbody>
        </table>
        <p style={{ marginTop: "20px" }}>
          Officer Signature: ____________________
        </p>
      </div>
      <Button onClick={generatePDF}>Cetak Pdf</Button>
    </div>
  );
};

export default PayrollPDF;
