import React, { useState } from "react";
import { FaUserCircle, FaEdit, FaLock, FaTrashAlt, FaMapMarkerAlt, FaEnvelope, FaPhoneAlt, FaBoxOpen } from "react-icons/fa";

const ProfilePage = () => {
  const [user, setUser] = useState({
    name: "John Doe",
    email: "john.doe@email.com",
    phone: "+225 0707070707",
    address: "Cocody, Abidjan, Côte d’Ivoire",
    profileImage: null,
  });

  const [orders] = useState([
    { id: "CMD-4587", date: "15 Oct 2025", total: 45000, status: "Livrée" },
    { id: "CMD-4512", date: "02 Oct 2025", total: 125000, status: "En cours" },
    { id: "CMD-4468", date: "22 Sept 2025", total: 75000, status: "Annulée" },
  ]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser({ ...user, profileImage: URL.createObjectURL(file) });
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("fr-FR", { style: "currency", currency: "XOF" }).format(value);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 flex justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-lg overflow-hidden">

        {/* HEADER DU PROFIL */}
        <div className="relative bg-gradient-to-r from-amber-500 to-amber-600 h-40">
          <div className="absolute -bottom-14 left-6 flex items-center gap-4">
            <div className="relative">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profil"
                  className="w-28 h-28 rounded-full border-4 border-white object-cover"
                />
              ) : (
                <FaUserCircle className="w-28 h-28 text-white drop-shadow-lg" />
              )}
              <label
                htmlFor="upload"
                className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow cursor-pointer hover:bg-slate-100"
              >
                <FaEdit className="text-amber-600" />
              </label>
              <input id="upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>
            <div className="text-white">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-sm opacity-90">{user.email}</p>
            </div>
          </div>
        </div>

        {/* CONTENU */}
        <div className="pt-20 px-6 sm:px-10 pb-10 space-y-10">
          {/* INFOS PERSO */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Informations personnelles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-lg">
              <div className="flex items-center gap-3 text-slate-700">
                <FaUserCircle className="text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">Nom complet</p>
                  <p className="font-semibold">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <FaEnvelope className="text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-semibold">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <FaPhoneAlt className="text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">Téléphone</p>
                  <p className="font-semibold">{user.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-slate-700">
                <FaMapMarkerAlt className="text-amber-500" />
                <div>
                  <p className="text-sm text-slate-500">Adresse</p>
                  <p className="font-semibold">{user.address}</p>
                </div>
              </div>
            </div>
          </section>

          {/* COMMANDES RÉCENTES */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Commandes récentes</h2>
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-100 text-slate-700 font-semibold">
                  <tr>
                    <th className="py-3 px-4">ID Commande</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Montant</th>
                    <th className="py-3 px-4">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id} className="border-t hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium text-slate-800">{order.id}</td>
                      <td className="py-3 px-4">{order.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        {formatCurrency(order.total)}
                      </td>
                      <td
                        className={`py-3 px-4 font-semibold ${
                          order.status === "Livrée"
                            ? "text-green-600"
                            : order.status === "En cours"
                            ? "text-amber-600"
                            : "text-red-600"
                        }`}
                      >
                        {order.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* PARAMÈTRES DU COMPTE */}
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Paramètres du compte</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button className="flex items-center justify-center gap-2 bg-amber-500 text-white py-3 rounded-lg hover:bg-amber-600 transition font-medium">
                <FaLock /> Changer le mot de passe
              </button>
              <button className="flex items-center justify-center gap-2 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition font-medium">
                <FaTrashAlt /> Supprimer le compte
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;