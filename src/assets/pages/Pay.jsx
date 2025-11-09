import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import paymentService from "../configurations/services/pay.js";

export default function PaymentPage() {
  const { link } = useParams(); 
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    paymentService.verifyPayment(link)
      .then(res => {
        setPayment(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [link]);

  const handlePayment = async () => {
    await paymentService.confirmPayment(payment.id);
    setDone(true);
  };

  if (loading) return <p style={{ margin: 20 }}>Chargement...</p>;

  if (!payment) return <h2 style={{ margin: 20 }}>Lien invalide</h2>;

  if (done) return <h2 style={{ margin: 20 }}>✅ Paiement confirmé !</h2>;

  return (
    <div style={{ padding: 30 }}>
      <h1>Paiement du service #{payment.service_id}</h1>
      <p>Utilisateur : {payment.user_id}</p>
      <p>Date : {payment.created_at}</p>

      {payment.payment ? (
        <h3 style={{ color: "green" }}>Déjà payé ✔️</h3>
      ) : (
        <button
          onClick={handlePayment}
          style={{
            padding: "10px 18px",
            background: "black",
            color: "white",
            borderRadius: 8,
            marginTop: 20
          }}
        >
          Payer maintenant
        </button>
      )}
    </div>
  );
}
