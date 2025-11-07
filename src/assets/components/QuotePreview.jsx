import React, { useRef, useState } from "react";
import { 
  X, Eye, Send, Download, User, Mail, Phone, MapPin, Globe, 
  Package, AlertCircle, Euro, Calendar
} from "lucide-react";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const QuotePreview = ({ quoteData, request = null, mode = 'client', onClose, onSend, onDownload, onRespond }) => {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateItemTotal = (item) => item.quantity * item.unitPrice;
  
  const calculateSubtotal = () => 
    quoteData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return quoteData.discountType === "percent" 
      ? (subtotal * quoteData.discount) / 100 
      : quoteData.discount;
  };
  
  const calculateTotal = () => calculateSubtotal() - calculateDiscount();

  const [estimationAmount, setEstimationAmount] = useState(() => {
    try {
      const total = calculateTotal();
      return Number.isFinite(total) ? total : 0;
    } catch {
      return 0;
    }
  });
  const [deliveryTime, setDeliveryTime] = useState(quoteData?.projectDeadline || "");
  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  const quoteRef = useRef(null);

  const handleRespond = async () => {
    if (!onRespond) return;
    setSending(true);
    setSendError(null);
    try {
      // Générer un PDF du bloc de devis affiché
      let pdf_base64 = null;
      let pdf_name = null;
      if (quoteRef.current && request?.id) {
        setIsCapturing(true);
        await new Promise(r => setTimeout(r, 100));
        const canvas = await html2canvas(quoteRef.current, {
          scale: Math.max(2, window.devicePixelRatio || 2),
          useCORS: true,
          allowTaint: true,
          background: '#ffffff',
          scrollY: -window.scrollY,
          foreignObjectRendering: true,
          logging: false,
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        // Adapter pour tenir sur une seule page A4
        const scaleToFit = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
        const imgWidth = canvas.width * scaleToFit;
        const imgHeight = canvas.height * scaleToFit;
        const offsetX = (pageWidth - imgWidth) / 2;
        const offsetY = 0; // haut de page
        pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
        const dataUri = pdf.output('datauristring');
        const prefix = 'data:application/pdf;base64,';
        pdf_base64 = dataUri.startsWith(prefix) ? dataUri.slice(prefix.length) : null;
        pdf_name = `Devis_Digital_${request.id}_${Date.now()}.pdf`;
        setIsCapturing(false);
      }

      await onRespond({
        estimation_amount: estimationAmount,
        delivery_time: deliveryTime,
        message: replyMessage,
        pdf_base64,
        pdf_name,
      });
    } catch (e) {
      setSendError(e?.message || 'Échec de l’envoi de la réponse');
    } finally {
      setSending(false);
      setIsCapturing(false);
    }
  };

  const handleDownloadLocal = async () => {
    setDownloading(true);
    try {
      if (!quoteRef.current) throw new Error('Contenu du devis introuvable');
      setIsCapturing(true);
      await new Promise(r => setTimeout(r, 100));
      const canvas = await html2canvas(quoteRef.current, {
        scale: Math.max(2, window.devicePixelRatio || 2),
        useCORS: true,
        allowTaint: true,
        background: '#ffffff',
        scrollY: -window.scrollY,
        foreignObjectRendering: true,
        logging: false,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'pt', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Adapter pour tenir sur une seule page A4
      const scaleToFit = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
      const imgWidth = canvas.width * scaleToFit;
      const imgHeight = canvas.height * scaleToFit;
      const offsetX = (pageWidth - imgWidth) / 2;
      const offsetY = 0;
      pdf.addImage(imgData, 'PNG', offsetX, offsetY, imgWidth, imgHeight);
      const fileName = `Devis_Digital_${request?.id ?? 'SansID'}_${Date.now()}.pdf`;
      pdf.save(fileName);
    } catch (e) {
      alert(e?.message || 'Échec du téléchargement du PDF');
    } finally {
      setDownloading(false);
      setIsCapturing(false);
    }
  };

React.useEffect(() => {
  const style = document.createElement("style");
  style.textContent = `
    @media print {
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        box-sizing: border-box !important;
      }
      
      html, body {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 0 !important;
        overflow: hidden !important;
      }
      
      body > *:not(#root) {
        display: none !important;
      }
      
      .print-hidden {
        display: none !important;
      }
      
      @page {
        size: A4;
        margin: 0mm;
      }
      
      /* Container principal - 1 PAGE FIXE */
      #pdf-content {
        width: 210mm !important;
        height: 297mm !important;
        padding: 8mm 12mm !important;
        margin: 0 !important;
        overflow: hidden !important;
        display: flex !important;
        flex-direction: column !important;
        background: white !important;
      }
      
      /* MASQUER les CGV à l'impression pour gagner de la place */
      #pdf-content .terms-page-break {
        display: none !important;
      }
      
      /* Toutes les polices en taille réduite */
      #pdf-content * {
        font-size: 8pt !important;
        line-height: 1.2 !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Fallback couleurs simples pour capture canvas */
      #pdf-content { color: #111 !important; background: #ffffff !important; }
      #pdf-content .bg-indigo-50 { background: #eef2ff !important; }
      #pdf-content .text-indigo-900 { color: #312e81 !important; }
      #pdf-content .border-indigo-200 { border-color: #c7d2fe !important; }
      #pdf-content .bg-gray-50 { background: #f9fafb !important; }
      #pdf-content .border-gray-200 { border-color: #e5e7eb !important; }
      
      #pdf-content h1 {
        font-size: 16pt !important;
        margin-bottom: 2mm !important;
      }
      
      #pdf-content h2 {
        font-size: 14pt !important;
        margin-bottom: 2mm !important;
      }
      
      #pdf-content h3 {
        font-size: 10pt !important;
        margin-bottom: 1.5mm !important;
      }
      
      /* Espacements minimaux */
      #pdf-content > div {
        margin-bottom: 3mm !important;
      }
      
      #pdf-content .mb-12 { margin-bottom: 3mm !important; }
      #pdf-content .mb-8 { margin-bottom: 2.5mm !important; }
      #pdf-content .mb-4 { margin-bottom: 2mm !important; }
      #pdf-content .pb-8 { padding-bottom: 2mm !important; }
      #pdf-content .pt-8 { padding-top: 2mm !important; }
      #pdf-content .mt-12 { margin-top: 3mm !important; }
      
      #pdf-content .p-6, #pdf-content .p-4, #pdf-content .px-8, #pdf-content .py-6 {
        padding: 2mm !important;
      }
      
      #pdf-content .px-4, #pdf-content .py-4, #pdf-content .py-3 {
        padding: 1mm !important;
      }
      
      /* Images/logos compacts */
      #pdf-content img {
        max-width: 35px !important;
        max-height: 35px !important;
      }
      
      /* Tables ultra-compactes */
      #pdf-content table {
        margin: 0 !important;
      }
      
      #pdf-content table th,
      #pdf-content table td {
        padding: 1mm 1.5mm !important;
        font-size: 7pt !important;
      }
      
      #pdf-content table thead th {
        padding: 1.5mm !important;
      }
      
      /* Zones de signature réduites */
      #pdf-content .h-20 {
        height: 15mm !important;
      }
      
      /* Grid modalités/totaux plus compact */
      #pdf-content .grid-cols-2 {
        gap: 2mm !important;
      }
      
      /* Borders plus fines */
      #pdf-content .border-2 {
        border-width: 1px !important;
      }
      
      #pdf-content .border-b-2 {
        border-bottom-width: 1px !important;
      }
      
      #pdf-content .border-t-2 {
        border-top-width: 1px !important;
      }
      
      /* Icônes plus petites */
      #pdf-content svg {
        width: 10px !important;
        height: 10px !important;
      }
    }

    /* Mode capture PDF: forcer A4 et compacter le layout */
    .pdf-capture {
      width: 794px !important; /* 210mm @ 96DPI */
      height: 1123px !important; /* 297mm @ 96DPI */
      overflow: hidden !important;
      padding: 12px !important;
      margin: 0 !important;
      background: #ffffff !important;
      display: flex !important;
      flex-direction: column !important;
    }
    .pdf-capture * {
      font-size: 12px !important;
      line-height: 1.25 !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    .pdf-capture .no-page-break { page-break-inside: avoid !important; }
    .pdf-capture .terms-page-break { display: none !important; }
    .pdf-capture .print-hidden { display: none !important; }
    .pdf-capture .mb-12 { margin-bottom: 8px !important; }
    .pdf-capture .mb-8 { margin-bottom: 6px !important; }
    .pdf-capture .mb-4 { margin-bottom: 4px !important; }
    .pdf-capture .pb-8 { padding-bottom: 6px !important; }
    .pdf-capture .pt-8 { padding-top: 6px !important; }
    .pdf-capture .mt-12 { margin-top: 8px !important; }
    .pdf-capture .p-6, .pdf-capture .p-4, .pdf-capture .px-8, .pdf-capture .py-6 { padding: 6px !important; }
    .pdf-capture .px-4, .pdf-capture .py-4, .pdf-capture .py-3 { padding: 4px !important; }
    .pdf-capture img { max-width: 32px !important; max-height: 32px !important; }
    .pdf-capture table { margin: 0 !important; }
    .pdf-capture table th, .pdf-capture table td { padding: 4px !important; font-size: 10px !important; }
    .pdf-capture .h-20 { height: 60px !important; }
    .pdf-capture .grid-cols-2 { gap: 6px !important; }
    .pdf-capture .border-2 { border-width: 1px !important; }
    .pdf-capture .border-b-2 { border-bottom-width: 1px !important; }
    .pdf-capture .border-t-2 { border-top-width: 1px !important; }
    .pdf-capture svg { width: 12px !important; height: 12px !important; }
  `;
  document.head.appendChild(style);
  return () => document.head.removeChild(style);
}, []);


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 print:bg-white print:block">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-auto print:max-w-none print:shadow-none print:rounded-none print:max-h-none">
        {/* Header du modal */}
        <div className="sticky top-0 bg-gradient-to-r from-black/80 to-gray-600 text-white px-8 py-6 flex items-center justify-between rounded-t-2xl z-10 shadow-lg print-hidden">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Aperçu du Devis
            </h2>
            <p className="text-sm text-white/90 mt-1">Format PDF - Prêt pour l'impression</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Contenu PDF */}
        <div id="pdf-content" ref={quoteRef} className={`p-8 md:p-12 bg-white ${isCapturing ? 'pdf-capture' : ''}`}>
          {mode === 'backoffice' && request && (
            <div className="mb-8 p-6 bg-indigo-50 rounded-xl border-2 border-indigo-200 print-hidden">
              <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                <Eye className="w-4 h-4" /> Demande associée
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-slate-700">
                <p><strong>Client :</strong> {request.full_name || '-'}</p>
                <p className="flex items-center gap-2"><Mail className="w-3 h-3" /> {request.email || '-'}</p>
                <p className="flex items-center gap-2"><Phone className="w-3 h-3" /> {request.phone || '-'}</p>
                <p><strong>Type :</strong> {request.project_type || '-'}</p>
                <p className="md:col-span-2"><strong>Besoin :</strong> {request.project_description || '-'}</p>
                {request.attachment_url && (
                  <a href={request.attachment_url} target="_blank" rel="noreferrer" className="text-indigo-700 underline">
                    Voir pièce jointe
                  </a>
                )}
              </div>
            </div>
          )}
          {/* Header du devis */}
          <div className="flex justify-between items-start mb-12 pb-8 border-b-2 border-black/10 no-page-break">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16">
                  <img src="/img/web-app-manifest-512x512.png" alt="logo entreprise" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">DIGITAL</h1>
                  <p className="text-black font-medium">Solutions Digitales & Créatives</p>
                </div>
              </div>
              <div className="text-sm text-slate-600 space-y-1 ml-1">
                <p className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  France, Côte d'Ivoire
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  servicedigitalplus@proton.me
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  +33 6 10 69 47 08, +225 07 03 56 24 59
                </p>
                <p className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  www.digitalagency.sn
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/90 px-6 py-3 rounded-xl mb-4">
                <h2 className="text-3xl font-bold text-black">DEVIS</h2>
              </div>
              <div className="text-sm space-y-1 bg-slate-50 p-4 rounded-lg">
                <p className="text-slate-600">
                  N° <span className="font-mono font-bold text-gray-600">{quoteData.quoteNumber}</span>
                </p>
                <p className="text-slate-600">
                  <strong>Date :</strong> {new Date(quoteData.quoteDate).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-slate-600">
                  <strong>Validité :</strong> {new Date(quoteData.validityDate).toLocaleDateString('fr-FR')}
                </p>
                {quoteData.projectDeadline && (
                  <p className="text-slate-600">
                    <strong>Délai :</strong> {quoteData.projectDeadline}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Client info */}
          <div className="mb-8 p-6 bg-gray-50 rounded-xl border-2 border-gray-200">
            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 uppercase tracking-wide">
              <User className="w-4 h-4" />
              Informations Client
            </h3>
            <div className="space-y-1 text-sm">
              {quoteData.clientCompany && (
                <p className="font-bold text-slate-900 text-lg">{quoteData.clientCompany}</p>
              )}
              {quoteData.clientSector && (
                <p className="text-slate-600 italic">Secteur: {quoteData.clientSector}</p>
              )}
              <p className="text-slate-700 font-medium">{quoteData.clientName}</p>
              {quoteData.clientAddress && <p className="text-slate-700">{quoteData.clientAddress}</p>}
              {(quoteData.clientCity || quoteData.clientPostal) && (
                <p className="text-slate-700">{quoteData.clientPostal} {quoteData.clientCity}</p>
              )}
              <p className="text-slate-700 flex items-center gap-2">
                <Mail className="w-3 h-3" />
                {quoteData.clientEmail}
              </p>
              <p className="text-slate-700 flex items-center gap-2">
                <Phone className="w-3 h-3" />
                {quoteData.clientPhone}
              </p>
              {quoteData.clientWebsite && (
                <p className="text-slate-700 flex items-center gap-2">
                  <Globe className="w-3 h-3" />
                  {quoteData.clientWebsite}
                </p>
              )}
            </div>
          </div>

          {/* Prestations */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-black" />
              Détail des Prestations
            </h3>
            <div className="border-2 border-slate-200 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-black text-white">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">P.U.</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quoteData.items.map((item, index) => (
                    <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                      <td className="px-4 py-4 text-sm text-slate-700">
                        <div className="font-medium text-slate-900">{item.description || "-"}</div>
                        {item.service && item.service !== item.description && (
                          <div className="text-xs text-slate-500 mt-1">Service: {item.service}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-slate-700 font-medium">{item.quantity}</td>
                      <td className="px-4 py-4 text-sm text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-4 text-sm text-right font-bold text-slate-900">
                        {formatCurrency(calculateItemTotal(item))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

         {/* Modalités et Totaux - Sur la même ligne */}
          <div className="mb-8 grid grid-cols-2 gap-4">
            {/* Modalités */}
            <div className="space-y-3">
              {quoteData.paymentTerms && (
                <div className="p-4 bg-green-50 mb-1 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Euro className="w-4 h-4" />
                    Modalités de Paiement
                  </h4>
                  <p className="text-sm text-slate-700">{quoteData.paymentTerms}</p>
                </div>
              )}
              {quoteData.deliveryTerms && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Conditions de Livraison
                  </h4>
                  <p className="text-sm text-slate-700">{quoteData.deliveryTerms}</p>
                </div>
              )}
            </div>

            {/* Totaux */}
            <div className="space-y-2 bg-gray-50 p-6 rounded-xl border-2 border-gray-200">
              <div className="flex justify-between py-2 text-sm">
                <span className="text-slate-600">Sous-total HT :</span>
                <span className="font-semibold text-slate-900">{formatCurrency(calculateSubtotal())}</span>
              </div>
              {quoteData.discount > 0 && (
                <div className="flex justify-between py-2 text-sm text-emerald-600">
                  <span className="font-medium">Remise :</span>
                  <span className="font-bold">- {formatCurrency(calculateDiscount())}</span>
                </div>
              )}
              <div className="flex justify-between py-4 border-t-2 border-gray-300">
                <span className="text-lg font-bold text-gray-900">TOTAL NET :</span>
                <span className="text-lg font-bold text-gray-600">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="text-xs text-slate-500 text-center pt-2 italic">
                Montant en FCFA • TVA non applicable
              </div>
            </div>
          </div>

          {/* Notes */}
          {quoteData.notes && (
            <div className="mb-8 p-6 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <h3 className="text-sm font-bold text-amber-900 mb-2 flex items-center gap-2 uppercase tracking-wide">
                <AlertCircle className="w-4 h-4" />
                Notes Importantes
              </h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{quoteData.notes}</p>
            </div>
          )}

          

          {/* CGV - Sur une nouvelle page (masquées en capture pour tenir sur 1 page) */}
          <div className="pt-8 border-t-2 border-slate-200 terms-page-break">
            <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide">Conditions Générales de Vente</h3>
            <div className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">{quoteData.termsAndConditions}</div>
          </div>

          {/* Signature section */}
          <div className="mt-12 pt-8 border-t-2 border-slate-200 no-page-break">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <p className="text-sm font-bold text-slate-900 mb-2">Pour l'Agence</p>
                <div className="h-20 border-b-2 border-slate-300 mb-2"></div>
                <p className="text-xs text-slate-600">Signature & Cachet</p>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 mb-2">Bon pour Accord - Client</p>
                <div className="h-20 border-b-2 border-slate-300 mb-2"></div>
                <p className="text-xs text-slate-600">Date & Signature</p>
              </div>
            </div>
          </div>
        </div>

          {/* Réponse BackOffice */}
          {mode === 'backoffice' && (
            <div className="mt-8 p-6 bg-slate-50 rounded-xl border-2 border-slate-200 print-hidden">
              <h3 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                <Send className="w-4 h-4" /> Répondre au client
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-600">Montant estimé</label>
                  <input
                    type="number"
                    value={estimationAmount}
                    onChange={e => setEstimationAmount(Number(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-600">Délai (ex: 2 semaines)</label>
                  <input
                    type="text"
                    value={deliveryTime}
                    onChange={e => setDeliveryTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleRespond}
                    disabled={!onRespond || sending}
                    className="w-full px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 disabled:opacity-50"
                  >
                    {sending ? 'Envoi…' : 'Envoyer la réponse'}
                  </button>
                </div>
              </div>
              <textarea
                value={replyMessage}
                onChange={e => setReplyMessage(e.target.value)}
                placeholder="Message au client"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={4}
              />
              {sendError && <p className="mt-2 text-sm text-red-600">{sendError}</p>}
            </div>
          )}

          {/* Footer du modal */}
          <div className="sticky bottom-0 bg-gradient-to-r from-black/80 to-gray-600 border-t border-slate-700 px-8 py-6 flex justify-between items-center gap-4 rounded-b-2xl shadow-xl print-hidden">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors"
            >
              Fermer l'aperçu
            </button>
            <div className="flex gap-3">
              <button
                onClick={onSend}
                className="flex items-center gap-2 px-6 py-3 bg-black text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Send className="w-5 h-5" />
                Envoyer par Email
              </button>
              <button
                onClick={handleDownloadLocal}
                className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-black font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
              >
                <Download className="w-5 h-5" />
                {downloading ? 'Téléchargement…' : 'Télécharger PDF'}
              </button>
            </div>
          </div>
        </div>
    </div>
  );
};

export default QuotePreview;