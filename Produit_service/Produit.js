const mongoose = require("mongoose");

const ProduitSchema = mongoose.Schema({
    nom: { type: String, required: true },
    description: { type: String, required: true },
    prix: { type: Number, required: true },
    stock: { type: Number, required: true },
    created_at: { type: Date, default: Date.now }
});

module.exports = Produit = mongoose.model("produit", ProduitSchema);