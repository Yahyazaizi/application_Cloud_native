const express = require("express");
const app = express();
const PORT = process.env.PORT_ONE || 4002;
const mongoose = require("mongoose");
const Utilisateur = require("./utilisateur");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcryptjs');

mongoose.set('strictQuery', true);
mongoose.connect("mongodb://localhost/auth-service").then(()=>{
    console.log("Auth-service DB Connecter")
}).catch((err)=>console.log(err));;

app.use(express.json());


app.post('/auth/register', async (req, res) => {
    let { nom, email, mot_passe } = req.body;

    // Validate input
    if (!nom || !email || !mot_passe) {
        return res.status(400).json({ message: "Nom, email et mot de passe sont requis" });
    }

    const userExists = await Utilisateur.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    } else {
        bcrypt.hash(mot_passe, 10, (err, hash) => {
            if (err) {
                console.error("Erreur lors du hachage du mot de passe:", err.message);
                return res.status(500).json({ error: "Erreur serveur" });
            } else {
                const newUtilisateur = new Utilisateur({
                    nom,
                    email,
                    mot_passe: hash // Save the hashed password
                });

                newUtilisateur.save()
                    .then(user => res.status(201).json(user))
                    .catch(error => {
                        console.error("Erreur lors de l'enregistrement de l'utilisateur:", error.message);
                        res.status(500).json({ error: "Erreur serveur" });
                    });
            }
        });
    }
});

app.post("/auth/login", async (req, res) => {
    const { email, mot_passe } = req.body;

    // Validate input
    if (!email || !mot_passe) {
        return res.status(400).json({ message: "Email et mot de passe sont requis" });
    }

    const utilisateur = await Utilisateur.findOne({ email });

    if (!utilisateur) {
        return res.status(404).json({ message: "Utilisateur introuvable" });
    } else {
        // Ensure mot_passe exists in the database
        if (!utilisateur.mot_passe) {
            return res.status(500).json({ message: "Mot de passe manquant pour cet utilisateur" });
        }

        bcrypt.compare(mot_passe, utilisateur.mot_passe).then(resultat => {
            if (!resultat) {
                return res.status(401).json({ message: "Mot de passe incorrect" });
            } else {
                const payload = {
                    email,
                    nom: utilisateur.nom
                };
                jwt.sign(payload, "secret", (err, token) => {
                    if (err) {
                        console.error("Erreur lors de la génération du token:", err.message);
                        return res.status(500).json({ message: "Erreur serveur" });
                    } else {
                        return res.json({ token });
                    }
                });
            }
        }).catch(err => {
            console.error("Erreur lors de la comparaison des mots de passe:", err.message);
            res.status(500).json({ message: "Erreur serveur" });
        });
    }
});

app.get("/auth/profil", (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: "Token manquant" });
    }

    jwt.verify(token, "secret", async (err, user) => {
        if (err) {
            return res.status(401).json({ error: "Token invalide" });
        }

        const utilisateur = await Utilisateur.findOne({ email: user.email });
        if (!utilisateur) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json(utilisateur);
    });
});

app.listen(PORT, () => {
    console.log(`Auth-Service at ${PORT}`);
});


//post localhost:4002/auth/register
// {
//     "nom": "Yahya",
// "email":"yahya@gmail.com",
//     "mot_passe":"123456"

// }

//post localhost:4002/auth/login
// {
//     
// "email":"yahya@gmail.com",
//     "mot_passe":"123456"

// }
// Méthode: GET
// URL: http://localhost:4002/auth/profil  Authorization: Bearer <token>



// {
//     " email_utilisateur":"yahyacom.gmail.com",
//     "ids":[
//         "67e7d211d2b1299ec499a48c",
//         "67e6eeca4da19d776e417942"
// ]
// }