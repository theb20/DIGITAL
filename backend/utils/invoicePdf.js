import PDFDocument from "pdfkit";

export async function generateInvoicePDF(invoice, options = {}) {
  const {
    logoUrl = null,
    companyName = "Digital Company",
  } = options;

  const doc = new PDFDocument({
    size: "A4",
    margin: 28,
  });

  const chunks = [];

  return await new Promise(async (resolve, reject) => {
    doc.on("data", (c) => chunks.push(c));
    doc.on("error", reject);
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    /* ----------------------------
       ✅ ENTÊTE STYLE TICKET DE CAISSE
       ---------------------------- */
    try {
      if (logoUrl && typeof fetch === "function") {
        const res = await fetch(logoUrl);
        if (res.ok) {
          const buf = Buffer.from(await res.arrayBuffer());
          doc.image(buf, { width: 60, align: "center" });
          doc.moveDown(0.4);
        }
      }
    } catch (_) {}

    doc
      .fontSize(12)
      .fillColor("#000")
      .text(companyName.toUpperCase(), { align: "center" });

    doc
      .fontSize(8)
      .fillColor("#555")
      .text("Ticket de caisse / Facture", { align: "center" });

    drawLine(doc);

    /* ----------------------------
       ✅ INFO TICKET (style compact)
       ---------------------------- */
    const number = `TKT-${String(invoice.id).padStart(6, "0")}`;
    const issued = new Date(invoice.issued_date);
    const due = invoice.due_date ? new Date(invoice.due_date) : null;

    doc
      .fontSize(8)
      .fillColor("#222")
      .text(`Ticket N° : ${number}`)
      .text(`Émise le : ${issued.toLocaleDateString("fr-FR")}`)
      .text(`Échéance : ${due ? due.toLocaleDateString("fr-FR") : "-"}`);

    drawLine(doc);

    /* ----------------------------
       ✅ CLIENT
       ---------------------------- */
    doc
      .fontSize(8)
      .fillColor("#000")
      .text("Client :", { underline: false });

    doc
      .fontSize(8)
      .fillColor("#333")
      .text(`${invoice.client_name || "-"}`)
      .text(`${invoice.requester_email || "-"}`);

    drawLine(doc);

    /* ----------------------------
       ✅ MONTANT (mode ticket)
       ---------------------------- */
    doc.fontSize(9).fillColor("#000").text("Montant TTC :", {});

    doc
      .fontSize(13)
      .fillColor("#000")
      .text(`${Number(invoice.amount).toFixed(2)} FCFA`, {
        align: "right",
      });

    drawLine(doc);

    /* ----------------------------
       ✅ PIED DE PAGE
       ---------------------------- */
    doc
      .moveDown(0.5)
      .fontSize(7)
      .fillColor("#666")
      .text("Merci pour votre confiance.", { align: "center" });

    doc.end();
  });
}

/* =============================
   PETITE FONCTION LIGNE FINE
   ============================= */
function drawLine(doc) {
  doc
    .moveDown(0.5)
    .strokeColor("#ddd")
    .lineWidth(0.5)
    .moveTo(10, doc.y)
    .lineTo(Math.max(10, (doc.page?.width || 595) - 40), doc.y)
    .stroke();
  doc.moveDown(0.4);
}
