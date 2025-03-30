const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4004;
const mongoose = require("mongoose");
const Livraison = require("./Livraison");
const axios = require("axios");

app.use(express.json());

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost/livraison-service")
    .then(() => {
        console.log("Livraison-service DB Connected");
    })
    .catch((err) => {
        console.error("Erreur de connexion à MongoDB :", err);
    });

// POST /livraison/ajouter
app.post("/livraison/ajouter", async (req, res) => {
    const { commande_id, transporteur_id, adresse_livraison } = req.body;

    try {
        // Verify if the command exists
        const response = await axios.get(`http://localhost:4001/commande/${commande_id}`);
        if (!response.data) {
            return res.status(404).json({ error: "Commande non trouvée" });
        }

        // Create a new delivery
        const newLivraison = new Livraison({
            commande_id,
            transporteur_id,
            statut: "En attente", // Default status
            adresse_livraison,
        });

        await newLivraison.save();
        res.status(201).json(newLivraison);
    } catch (err) {
        // Improved error handling
        console.error("Erreur lors de la création de la livraison:", err.message);
        res.status(500).json({ error: "Erreur lors de la création de la livraison", details: err.message });
    }
});

// PUT /livraison/:id
app.put("/livraison/:id", (req, res) => {
    const { statut } = req.body;

    Livraison.findByIdAndUpdate(req.params.id, { statut }, { new: true })
        .then(updatedLivraison => {
            if (!updatedLivraison) {
                return res.status(404).json({ error: "Livraison non trouvée" });
            }
            res.status(200).json(updatedLivraison);
        })
        .catch(err => {
            // Improved error handling
            console.error("Erreur lors de la mise à jour de la livraison:", err.message);
            res.status(500).json({ error: "Erreur serveur", details: err.message });
        });
});

app.listen(PORT, () => {
    console.log(`Livraison-Service running on port ${PORT}`);
});

// Method: POST
// URL: http://localhost:4004/livraison/ajouter


// {
//     "commande_id": "<commande_id>",
//     "transporteur_id": "12345",
//     "adresse_livraison": "123 Rue Exemple, Ville"
//   }


// Method: PUT
// URL: http://localhost:4004/livraison/:id


// {
//     "statut": "Livrée"
//   }