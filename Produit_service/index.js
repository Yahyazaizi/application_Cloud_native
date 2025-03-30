const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4000;
const mongoose = require("mongoose");
const Produit = require("./Produit");

app.use(express.json());

mongoose.set('strictQuery',true);
mongoose.connect("mongodb://localhost/produit-service").then(()=>{
    console.log("Produit-service DB Connecter")
}).catch((err)=>console.log(err));

app.post("/produit/ajouter", (req, res, next) => {
    const { nom, description, prix, stock } = req.body; // Corrected 'desciption' to 'description'
    const newProduit = new Produit({
        nom,
        description, // Corrected here
        prix,
        stock: stock || 0 // Initial stock set to 0 if not provided
    });

    newProduit.save()
        .then(produit => res.status(201).json(produit))
        .catch(err => res.status(400).json({ err }));
});

app.post("/produit/acheter", (req, res) => { 
    const { ids } = req.body;
    Produit.find({ _id: { $in: ids } })
        .then(produits => res.status(200).json(produits))
        .catch(error => {
            console.error("Error fetching products:", error);
            res.status(400).json({ error: "Erreur lors de la récupération des produits" });
        });
});

app.listen(PORT, ()=>{
    console.log(`Product-Service at ${PORT}`);
});
app.get("/produit/liste", (req, res) => {
    Produit.find()
      .then(produits => res.status(200).json(produits))
      .catch(err => res.status(500).json({ error: err }));
  });
  

app.get("/produit/:id", (req, res) => {
    Produit.findById(req.params.id)
        .then(produit => {
            if (!produit) {
                return res.status(404).json({ error: "Produit non trouvé" });
            }
            res.status(200).json(produit);
        })
        .catch(err => res.status(500).json({ error: "Erreur serveur", details: err.message }));
});

app.patch("/produit/:id/stock", (req, res) => {
    const { stock } = req.body;
    Produit.findByIdAndUpdate(req.params.id, { stock }, { new: true })
        .then(updatedProduit => {
            if (!updatedProduit) {
                return res.status(404).json({ error: "Produit non trouvé" });
            }
            res.status(200).json(updatedProduit);
        })
        .catch(err => res.status(500).json({ error: "Erreur serveur", details: err.message }));
});

// Méthode : post

// URL : http://localhost:4000/produit/acheter
// {
  
//     "ids":
//       "67e6c71d2d072f5c268002a2"
       
//      }


// Méthode : GET

// URL : http://localhost:4000/produit/liste tout les donne
// localhost:4000/produit/67e56a7536932041b6e023fe

// Méthode : POST

// URL : http://localhost:4000/produit/ajouter

// {
//     "nom": "Fairy",
//     "description": "Produit de nettoyage",
//     "prix": 130,
//     "stock": 50
//   }


// Méthode: GET
// URL: http://localhost:4000/produit/liste
// Obtenir un produit par ID

// Méthode: GET
// URL: http://localhost:4000/produit/:id
// Mettre à jour le stock d'un produit

// Méthode: PATCH
// URL: http://localhost:4000/produit/:id/stock
