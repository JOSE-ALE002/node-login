// Estos dos modulos trabajan junto a express-session para la creacion de sessiones

// Modulo para definir los metodos de authenticacion
// Passport permite crear authenticaciones con redes sociales ("facebook", "twitter", "google");
const passport = require('passport');
const helpers = require("./helpers");
const pool = require("../database");

// Con este modulo se puede hacer una authenticacion local es decir con una propia base de datos
const LocalStrategy = require('passport-local').Strategy;

// AUTENTICACION DE LOGIN
passport.use("local.signin", new LocalStrategy({
    usernameField: "username",
    passwordField: "password",
    passReqToCallback: true
}, async (req, username, password, done) => {
    const rows = await pool.query("SELECT * FROM users WHERE username = ?", [username]);

    if (rows.length > 0) {
        const user = rows[0];
        const validPassword = await helpers.mathPassport(password, user.password);

        if (validPassword) {
            done(null, user, req.flash('success', 'Welcome ' + user.username));
        } else {
            done(null, false, req.flash('message', 'Incorrect Password')); 
        }
    } else {
        return done(null, false, req.flash('message', 'The Username does not exist'));
    }
}));


// AUTENTICACION DE REGISTRO
// Definimos el nombre de la authenticacion en este caso se llamara "local.signup"
passport.use('local.signup', new LocalStrategy({

    // Definimos el campo y el nombre del valor con el que se recibira el valor desde la vista en el formulario
    usernameField: "username",
    passwordField: "password",

    // Para guardar mas datos en el registro como el nombre completo, edad, u otros datos y, para recibir los demas datos atraves del
    // req.body pero para eso hay que agregar la siguiente linea 
    // Esto para poder recibir el objeto request, dentro de la funcion callback siguiente que ejecuta este LocalStrategy
    passReqToCallback: true
}, async (req, username, password, done) => {
    // Para seguir con el resto del codigo del servidor la funcion recibe otro callback "done", por lo tanto done se ejecuta cuando hemos terminado con el 
    // proceso de authenticacion para que continue con lo demas procesos

    const {
        fullname
    } = req.body;

    const newUser = {
        username,
        password,
        fullname
    };

    newUser.password = await helpers.encryptPassword(password);

    // GUARDAMOS EL USUARIO EN LA BASE DE DATOS
    const result = await pool.query("INSERT INTO users SET ?", [newUser]);

    // Agregamos el id al objeto del nuevo usuario
    newUser.idUser = result.insertId;

    return done(null, newUser);
}));


// Para definirlo bien hay que agregar unos cuantos middlewares
// Hay que definir dos partes de passport, una para serializarlo y una para deserializarlo

// Metodo para guardar el usuario en la sesion
passport.serializeUser((user, done) => {
    done(null, user.idUser);
});

// En la deserializacion tomamos el id para volver a tomar los datos
passport.deserializeUser(async (id, done) => {
    const rows = await pool.query("SELECT * FROM users WHERE idUser = ?", [id]);

    done(null, rows[0])
});