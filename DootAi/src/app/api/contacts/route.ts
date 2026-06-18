import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const contactsFilePath = path.join(process.cwd(), "src/lib/data/contacts.json");

function readContacts() {
  try {
    if (!fs.existsSync(contactsFilePath)) {
      return [];
    }
    const fileContent = fs.readFileSync(contactsFilePath, "utf-8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error("Error reading contacts file:", error);
    return [];
  }
}

function writeContacts(contacts: any) {
  try {
    fs.writeFileSync(contactsFilePath, JSON.stringify(contacts, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing contacts file:", error);
    return false;
  }
}

export async function GET(req: NextRequest) {
  try {
    const contacts = readContacts();
    return NextResponse.json({ success: true, contacts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const contacts = readContacts();

    if (body.action === "add-note") {
      const { contactId, text, author } = body;
      const contactIndex = contacts.findIndex((c: any) => c.id === contactId);

      if (contactIndex === -1) {
        return NextResponse.json({ success: false, error: "Contact not found" }, { status: 404 });
      }

      const newNote = {
        text,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        author: author || "Himanshu"
      };

      if (!contacts[contactIndex].notes) {
        contacts[contactIndex].notes = [];
      }
      contacts[contactIndex].notes.unshift(newNote); // Put newest note first
      writeContacts(contacts);

      return NextResponse.json({ success: true, contact: contacts[contactIndex] });
    } else {
      // Adding a new contact
      const { name, email, company, phone, tags, role, address, website } = body;
      
      const newContact = {
        id: String(Date.now()),
        name: name || "New Contact",
        email: email || "",
        company: company || "",
        phone: phone || "",
        tags: tags || ["Lead"],
        favorite: false,
        role: role || "",
        address: address || "",
        website: website || "",
        notes: []
      };

      contacts.unshift(newContact);
      writeContacts(contacts);

      return NextResponse.json({ success: true, contact: newContact });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
