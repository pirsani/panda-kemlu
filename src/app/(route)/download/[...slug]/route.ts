import Docxtemplater from "docxtemplater";
import fs from "fs";
import { NextResponse } from "next/server";
import path from "path";
import PizZip from "pizzip";

export async function GET(
  req: Request,
  { params }: { params: { slug: string[] } }
) {
  const buf = updateWordTemplate({ nomorSpk: "12345" });
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": "attachment; filename=updated-template.docx",
    },
  });
  //return new Response(`Download ${params.slug.join("/")}`);
}

// Function to update the Word template

interface WordTemplateData {
  nomorSpk: string;
}

export function updateWordTemplate(data: WordTemplateData) {
  // Resolve the path to the Word document
  const templatePath = path.resolve(
    process.cwd(),
    "src/templates/words/dokumen-pengadaan.docx"
  );

  // Load the Word document as binary
  const content = fs.readFileSync(templatePath, "binary");

  // Load the binary content into pizzip
  const zip = new PizZip(content);

  // Create the docxtemplater instance
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
  });

  // Set the data for the template
  doc.setData(data);

  try {
    // Render the document (replace placeholders)
    doc.render();

    // Generate the updated document
    const buf = doc.getZip().generate({ type: "nodebuffer" });

    // // Save the updated document
    // const outputPath = path.resolve(
    //   process.cwd(),
    //   "public/updated-template.docx"
    // );
    // fs.writeFileSync(outputPath, buf);
    // console.log("Template updated successfully");
    // console.log("Template updated successfully");
    return buf;
  } catch (error) {
    console.error("Error updating template:", error);
  }
}
