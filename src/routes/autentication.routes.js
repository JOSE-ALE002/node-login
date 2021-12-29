const express = require('express');
const passport = require('passport');
const { isLoggedIn, isNotLoggedIn } = require("../lib/auth");

const router = express.Router();


router.get("/signup", isNotLoggedIn, (req, res) => {
    res.render("auth/signup")
});

// METODO ALTERNATICO
router.post("/signup", isNotLoggedIn ,passport.authenticate("local.signup", {
    // Este metodo toma el nombre de la authenticacion que hemos creado en el archivo /lib/passport en este caso el nombre es local.signup

    // Propiedad que se ejecuta cuando la authenticacion sale bien
    successRedirect: "/profile",

    // Propiedad que se ejecuta cuando la authenticacion sale mal
    failureRedirect: "/signup",

    // Propiedad para enviar un mensaje en caso falle, mensajes flash
    failureFlash: true
}));

router.get("/signin", isNotLoggedIn, async (req, res) => {
    res.render("auth/signin");
});

router.post("/signin", isNotLoggedIn ,async (req, res, next) => {
    passport.authenticate("local.signin", {
        successRedirect: "/profile",
        failureRedirect: "/signin",

        // Para enviar mensajes flash
        failureFlash: true       
    })(req, res, next);
});

router.get("/profile", isLoggedIn ,(req, res) => {
    res.render("index")
});

router.get("/logout", isLoggedIn, async (req, res) => {
    req.logOut();
    res.redirect("/signin"); 
});


module.exports = router;