const mongoose = require("mongoose");

const LivraisonSchema = mongoose.Schema({
    commande_id: { type: mongoose.Schema.Types.ObjectId, ref: "Commande", required: true },
    transporteur_id: { type: String, required: true },
    statut: { type: String, enum: ["En attente", "En cours", "Livrée"], default: "En attente" },
    adresse_livraison: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = Livraison = mongoose.model("livraison", LivraisonSchema);