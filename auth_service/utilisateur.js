const mongoose = require("mongoose");

const utilisateurSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    mot_passe: {
        type: String,
        required: true // Ensure mot_passe is required
    }
});

module.exports = mongoose.model("Utilisateur", utilisateurSchema);