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
      .then((data) => setPayment(data))
      .catch(() => setPayment(null))
      .finally(() => setLoading(false));
  }, [link]);

  const handlePayment = async () => {
    await paymentService.confirmPayment(payment.id);
    setDone(true);
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-lg font-medium">
        Chargement…
      </div>
    );

  if (!payment)
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-red-500">
        Lien invalide
      </div>
    );

  if (done)
    return (
      <div className="flex items-center justify-center h-screen text-2xl font-semibold text-green-600">
        ✅ Paiement confirmé !
      </div>
    );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-10">
      <div className="w-full max-w-xl bg-white shadow-xl rounded-xl p-8 space-y-5">

        {/* TITLE */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          {payment.service_title
            ? `Paiement pour : ${payment.service_title}`
            : `Paiement du service #${payment.service_id}`}
        </h1>

        {/* USER INFO */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-1">
          <p className="text-gray-700 font-medium">
            👤 Utilisateur :
            <span className="font-semibold">
              {" "}
              {payment.display_user_name || payment.user_id}
            </span>
          </p>
          {payment.display_user_email && (
            <p className="text-gray-600">{payment.display_user_email}</p>
          )}
          <p className="text-gray-500 text-sm">
            📅 Date : {new Date(payment.created_at).toLocaleString("fr-FR")}
          </p>
        </div>

        {/* STATUS */}
        {payment.payment ? (
          <div className="text-green-600 text-lg font-semibold">
            ✅ Déjà payé
          </div>
        ) : (
          <button
            onClick={handlePayment}
            className="w-full py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition-all duration-200"
          >
            💳 Payer maintenant
          </button>
        )}
      </div>
    </div>
  );
}
