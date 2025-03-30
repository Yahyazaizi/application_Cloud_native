const mongoose = require("mongoose");

const CommandeSchema = mongoose.Schema({
    produits: [
        {
            produit_id: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true },
            quantite: { type: Number, required: true }
        }
    ],
    client_id: { type: String, required: true },
    prix_total: { type: Number, required: true },
    statut: { type: String, enum: ["En attente", "Confirmée", "Expédiée"], default: "En attente" },
    created_at: { type: Date, default: Date.now }
});

module.exports = Commande = mongoose.model("commande", CommandeSchema);