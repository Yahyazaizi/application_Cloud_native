const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4001;
const mongoose = require("mongoose");
const Commande = require("./commande");
const axios = require('axios');
const isAuthenticated = require("./isAuthenticated")

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost/commande-service").then(()=>{
    console.log("Commande-service DB Connecter")
}).catch((err)=>console.log(err));

app.use(express.json());

function prixTotal(produits) {
    let total = 0;
    for (let t = 0; t < produits.length; ++t) {
        total += produits[t].prix;
    };
    return total;
}

async function httpRequest(ids) {
    try {
        const URL = "http://localhost:4000/produit/acheter"
        const response = await axios.post(URL, { ids: ids }, {
            headers: { 'Content-Type': 'application/json' }
        });
        
        return prixTotal(response.data);
    } catch (error) {
        console.error(error);
    }
}

app.post("/commande/ajouter", isAuthenticated, async (req, res) => {
    const { produits } = req.body;

    // Validate that 'produits' is defined and is an array
    if (!Array.isArray(produits) || produits.length === 0) {
        return res.status(400).json({ error: "La liste des produits est requise et doit être un tableau non vide" });
    }

    try {
        const produitIds = produits.map(p => p.produit_id); // Safe to use 'map' after validation
        const response = await axios.post("http://localhost:4000/produit/acheter", { ids: produitIds });
        const produitsData = response.data;

        let total = 0;
        for (const produit of produits) {
            const produitInfo = produitsData.find(p => p._id === produit.produit_id);
            if (!produitInfo || produitInfo.stock < produit.quantite) {
                return res.status(400).json({ error: "Stock insuffisant pour le produit " + produit.produit_id });
            }
            total += produitInfo.prix * produit.quantite;
        }

        const newCommande = new Commande({
            produits,
            client_id: req.user.email,
            prix_total: total,
            statut: "En attente",
        });

        await newCommande.save();

        for (const produit of produits) {
            await axios.patch(`http://localhost:4000/produit/${produit.produit_id}/stock`, {
                stock: produitsData.find(p => p._id === produit.produit_id).stock - produit.quantite,
            });
        }

        res.status(201).json(newCommande);
    } catch (err) {
        res.status(500).json({ error: "Erreur lors de la création de la commande", details: err.message });
    }
});

app.patch("/commande/:id/statut", (req, res) => {
    const { statut } = req.body;
    Commande.findByIdAndUpdate(req.params.id, { statut }, { new: true })
        .then(updatedCommande => {
            if (!updatedCommande) {
                return res.status(404).json({ error: "Commande non trouvée" });
            }
            res.status(200).json(updatedCommande);
        })
        .catch(err => res.status(500).json({ error: "Erreur serveur", details: err.message }));
});

app.get("/commande/:id", (req, res) => {
    Commande.findById(req.params.id)
        .then(commande => {
            if (!commande) {
                return res.status(404).json({ error: "Commande non trouvée" });
            }
            res.status(200).json(commande);
        })
        .catch(err => res.status(500).json({ error: "Erreur serveur", details: err.message }));
});

app.listen(PORT, () => {
    console.log(`Commande-Service at ${PORT}`);
});


// post localhost:4001/commande/ajouter
// {
//     "produits": [
//         { "produit_id": "67e5412d2f9b14e1457bb77e", "quantite": 2 },
//         { "produit_id": "67e5679faee9db45df716392", "quantite": 1 }
//     ]
// }



// Méthode: PATCH
// URL: http://localhost:4001/commande/:id/statut
// {
//     "statut": "Confirmée"
//   }
// {
//     "email_utilisateur": "yahya@gmail.com",  Authorization: Bearer <token>
//     "ids":[
//         "67e5412d2f9b14e1457bb77e",
//         "67e5679faee9db45df716392"
//     ]
// }


// post localhost:4001/commande/ajouter

// {
//    " email_utilisateur":"yahyacom.gmail.com",
//     "ids":[
//         "67e72fea523367c892187254",
//         "67e6eeca4da19d776e417942"
//     ]
// }

// {
 
//     "ids": [
//      "67e72fea523367c892187254",
//      "67e6c78d2d072f5c268002a5"
//    ]
//  }