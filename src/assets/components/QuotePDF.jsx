import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

// Utilitaires
const formatFCFA = (n) => {
  const num = typeof n === 'number' ? n : parseFloat(n || 0);
  return `${num.toLocaleString('fr-FR')} FCFA`;
};

const formatDateFR = (d) => {
  if (!d) return null;
  try {
    const date = new Date(d);
    if (isNaN(date.getTime())) return String(d);
    return date.toLocaleDateString('fr-FR');
  } catch {
    return String(d);
  }
};

const asArray = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val.filter(Boolean);
  if (typeof val === 'string') return val.split(',').map(s => s.trim()).filter(Boolean);
  return [String(val)].filter(Boolean);
};

// Normalisation des items
const normalizeItems = (quoteData) => {
  const raw = quoteData?.lineItems || quoteData?.items || quoteData?.products || quoteData?.services || [];
  return raw.map((it) => ({
    description: it?.description || it?.name || it?.title || '',
    qty: it?.quantity ?? it?.qty ?? 1,
    unit: it?.unitPrice ?? it?.price ?? it?.unit ?? 0,
    total: it?.total ?? ((it?.quantity ?? it?.qty ?? 1) * (it?.unitPrice ?? it?.price ?? 0)),
  }));
};

// Styles
const styles = StyleSheet.create({
  page: { padding: 38, fontSize: 11 },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  header: { marginBottom: 12 },
  title: { fontSize: 16, fontWeight: 700 },
  small: { fontSize: 10 },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginBottom: 6 },
  para: { fontSize: 10, lineHeight: 1.35 },
  card: { border: '1pt solid #e5e7eb', borderRadius: 6, padding: 10, marginBottom: 8 },
  table: { display: 'flex', width: '100%', border: '1pt solid #e5e7eb', borderRadius: 6, overflow: 'hidden', marginTop: 6 },
  th: { padding: 8, backgroundColor: '#f9fafb', borderRight: '1pt solid #e5e7eb', fontWeight: 700 },
  td: { padding: 8, borderTop: '1pt solid #e5e7eb', borderRight: '1pt solid #e5e7eb' },
  right: { textAlign: 'right' },
  bold: { fontWeight: 700 },
  logo: { width: 80, height: 80, objectFit: 'contain' }, // logo vectoriel
});

const QuotePDF = ({ quoteData, request }) => {
  const items = normalizeItems(quoteData);
  const subtotal = items.reduce((s, it) => s + (it.total ?? 0), 0);
  const discount = quoteData?.discountAmount || 0;
  const total = subtotal - discount;
  const paymentTerms = quoteData?.paymentTerms || quoteData?.terms || '';

  // Société émettrice du devis
  const company = quoteData?.company || quoteData?.agency || {};
  const companyName = (
    company?.name ||
    quoteData?.companyName ||
    (typeof quoteData?.company === 'string' ? quoteData.company : null) ||
    'DIGITAL'
  );
  // Normalisation des champs client pour refléter exactement la preview
  const clientSource = quoteData?.client || quoteData?.customer || quoteData?.prospect || {};
  const clientTop = {
    name: quoteData?.clientName || [quoteData?.clientFirstName, quoteData?.clientLastName].filter(Boolean).join(' '),
    company: quoteData?.clientCompany,
    address: quoteData?.clientAddress,
    city: quoteData?.clientCity,
    postal: quoteData?.clientPostal,
    email: quoteData?.clientEmail,
    phone: quoteData?.clientPhone,
    website: quoteData?.clientWebsite,
    sector: quoteData?.clientSector,
  };
  const client = {
    name: clientSource?.name ?? clientTop.name,
    full_name: clientSource?.full_name ?? undefined,
    clientType: quoteData?.clientType ?? clientSource?.clientType ?? undefined,
    company: clientSource?.company ?? clientTop.company,
    address: clientSource?.address ?? clientTop.address,
    city: clientSource?.city ?? clientTop.city,
    postal: clientSource?.postal ?? clientTop.postal,
    email: clientSource?.email ?? clientTop.email,
    phone: clientSource?.phone ?? clientTop.phone,
    website: clientSource?.website ?? clientTop.website,
    sector: clientSource?.sector ?? clientTop.sector,
  };

  const logoSrc = company?.logo || quoteData?.logoUrl || null;
  const reference = quoteData?.reference || quoteData?.quoteNumber || request?.reference || 'devis';
  const validity = quoteData?.validUntil || quoteData?.validity || null;
  const createdAt = quoteData?.date || quoteData?.createdAt || null;
  const notes = quoteData?.notes || quoteData?.importantNotes || '';
  const initialRequest = quoteData?.initialRequest || request?.message || request?.initial_message || '';
  const acceptanceLabel = quoteData?.acceptanceLabel || 'Bon pour Accord - Client';
  const legalMentions = quoteData?.legalMentions || company?.legalMentions || quoteData?.mentionsLegales || '';
  const termsAndConditions = quoteData?.termsAndConditions || quoteData?.conditionsGenerales || company?.terms || '';

  const companyAddress = company?.address || quoteData?.companyAddress || '';
  const companyCity = company?.city || quoteData?.companyCity || '';
  const companyCountry = company?.country || quoteData?.companyCountry || '';
  const companyReg = company?.registration || quoteData?.rc || '';
  const companyTax = company?.taxId || quoteData?.ninea || quoteData?.taxNumber || '';
  const companyTagline = company?.tagline || quoteData?.tagline || 'Solutions Digitales & Créatives';
  const companyPhones = asArray(company?.phones || company?.phone);
  const companyCountries = asArray(companyCountry || company?.countries || quoteData?.companyCountries);

  const invoiceDue = (() => {
    try {
      const base = createdAt ? new Date(createdAt) : null;
      if (!base) return null;
      const d = new Date(base);
      d.setDate(d.getDate() + Number(import.meta?.env?.VITE_INVOICE_DUE_DAYS || 14));
      return d;
    } catch { return null; }
  })();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={[styles.row, styles.header]}>
          <View style={[styles.col]}>
            {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : <Text style={styles.title}>DEVIS</Text>}
            <Text style={styles.bold}>{companyName}</Text>
            {companyTagline && <Text style={styles.small}>{companyTagline}</Text>}
            {company?.website && <Text style={styles.small}>{company.website}</Text>}
            {company?.email && <Text style={styles.small}>{company.email}</Text>}
            {companyPhones.map((p, i) => <Text key={i} style={styles.small}>{p}</Text>)}
            {companyCountries.length > 0 && <Text style={styles.small}>{companyCountries.join(', ')}</Text>}
            {companyAddress && <Text style={styles.small}>{companyAddress}</Text>}
            {(companyCity || companyCountry) && <Text style={styles.small}>{[companyCity, companyCountry].filter(Boolean).join(', ')}</Text>}
            {(companyReg || companyTax) && <Text style={styles.small}>Reg: {companyReg} · N° fiscal: {companyTax}</Text>}
          </View>
          <View style={[styles.col]}>
            <Text style={[styles.right, styles.title]}>DEVIS</Text>
            <Text style={[styles.right, styles.small]}>N° {reference}</Text>
            {createdAt && <Text style={[styles.right, styles.small]}>Date: {formatDateFR(createdAt)}</Text>}
            {validity && <Text style={[styles.right, styles.small]}>Validité: {formatDateFR(validity)}</Text>}
            {invoiceDue && <Text style={[styles.right, styles.small]}>Échéance facture: {formatDateFR(invoiceDue)}</Text>}
          </View>
        </View>

        {/* Infos client */}
        <View style={styles.card}>
          <Text style={styles.bold}>Informations Client</Text>
          {client?.company && <Text style={[styles.small, styles.bold]}>{client.company}</Text>}

          {client?.clientType && <Text style={[styles.small, styles.bold]}>{client.clientType}</Text>}
          {client?.full_name && <Text style={[styles.small, styles.bold]}>{client.full_name}</Text>}
          {client?.sector && <Text style={styles.small}>{`Secteur: ${client.sector}`}</Text>}
          {client?.name && <Text style={styles.small}>{client.name}</Text>}
          {client?.address && <Text style={styles.small}>{client.address}</Text>}
          {(client?.postal || client?.city) && (
            <Text style={styles.small}>
              {`${client?.postal ? client.postal + ' ' : ''}${client?.city || ''}`}
            </Text>
          )}
          {client?.email && <Text style={styles.small}>{client.email}</Text>}
          {client?.phone && <Text style={styles.small}>{client.phone}</Text>}
          {client?.website && <Text style={styles.small}>{client.website}</Text>}
        </View>

        {/* Tableau prestations */}
        <View style={styles.table} wrap>
          <View style={styles.row}>
            <View style={{ flex: 6 }}><Text style={styles.th}>Description</Text></View>
            <View style={{ flex: 1 }}><Text style={styles.th}>Qté</Text></View>
            <View style={{ flex: 3 }}><Text style={styles.th}>P.U.</Text></View>
            <View style={{ flex: 3 }}><Text style={styles.th}>Total</Text></View>
          </View>
          {items.map((it, idx) => (
            <View key={idx} style={styles.row}>
              <View style={{ flex: 6 }}><Text style={styles.td}>{it.description}</Text></View>
              <View style={{ flex: 1 }}><Text style={styles.td}>{it.qty}</Text></View>
              <View style={{ flex: 3 }}><Text style={[styles.td, styles.right]}>{formatFCFA(it.unit)}</Text></View>
              <View style={{ flex: 3 }}><Text style={[styles.td, styles.right]}>{formatFCFA(it.total)}</Text></View>
            </View>
          ))}
        </View>

        {/* Modalités & Totaux */}
        <View style={[styles.row, { marginTop: 10 }]}>
          <View style={[styles.col, styles.card]}>
            <Text style={styles.bold}>Modalités de Paiement</Text>
            <Text style={styles.small}>{paymentTerms || '50% à la commande, 50% à la livraison'}</Text>
          </View>

          <View style={[styles.col, styles.card]}>
            <View style={styles.row}>
              <View style={{ flex: 3 }}><Text style={styles.small}>Sous-total HT</Text></View>
              <View style={{ flex: 2 }}><Text style={[styles.small, styles.right]}>{formatFCFA(subtotal)}</Text></View>
            </View>
            {discount > 0 && (
              <View style={styles.row}>
                <View style={{ flex: 3 }}><Text style={styles.small}>Remise</Text></View>
                <View style={{ flex: 2 }}><Text style={[styles.small, styles.right]}>- {formatFCFA(discount)}</Text></View>
              </View>
            )}
            <View style={[styles.row, { marginTop: 6 }]}>
              <View style={{ flex: 3 }}><Text style={styles.bold}>TOTAL NET</Text></View>
              <View style={{ flex: 2 }}><Text style={[styles.bold, styles.right]}>{formatFCFA(total)}</Text></View>
            </View>
            <Text style={[styles.small, { marginTop: 6 }]}>Montant en FCFA · TVA non applicable</Text>
          </View>
        </View>

        {/* Notes importantes */}
        {notes && <View style={styles.card}><Text style={styles.bold}>Notes importantes</Text><Text style={styles.small}>{notes}</Text></View>}
        {initialRequest && <View style={styles.card}><Text style={styles.bold}>Demande initiale</Text><Text style={styles.small}>{initialRequest}</Text></View>}

        {/* Signature */}
        <View style={[styles.row, { marginTop: 22 }]}>
          <View style={styles.col}><Text style={styles.small}>Signature & Cachet</Text></View>
          <View style={styles.col}><Text style={[styles.small, styles.right]}>Date & Signature</Text></View>
        </View>

        {/* Bon pour accord */}
        <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.bold}>{acceptanceLabel}</Text></View>

        {/* Mentions légales */}
        {legalMentions && <View style={[styles.card, { marginTop: 12 }]}><Text style={styles.sectionTitle}>Mentions légales</Text><Text style={styles.para}>{legalMentions}</Text></View>}

        {/* Conditions générales */}
        {termsAndConditions && <View style={[styles.card, { marginTop: 12 }]} wrap><Text style={styles.sectionTitle}>Conditions générales</Text><Text style={styles.para}>{termsAndConditions}</Text></View>}
      </Page>
    </Document>
  );
};

export default QuotePDF;
