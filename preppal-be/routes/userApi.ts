const expressUserApi = require("express");
const routerUserApi = expressUserApi.Router();
const jwtUserApi = require("jsonwebtoken");
const configUserApi = require("../configs/secrets.ts")

const User = require("../models/user.ts");

/**
 * GET - Get all accounts
 */
routerUserApi.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server error")
    }
});


/**
 * GET - Get an account with corresponding username
 */
routerUserApi.get("/lookup/:username", async (req, res) => {
    let username = req.params.username;
    const user = await User.find( { username: username }).select("-password");
    if (!user) {
        return res.status(400).json({ errors: [{ msg: "User does not exist" }] });
    }

    res.status(201).json({user});
});


/**
 * POST - Create a user
 */
routerUserApi.post("/createUsers", async (req, res) => {
    try {
        const {username, password} = req.body;
        let user = await User.findOne({username: username});

        if (user) {
            return res.status(400).json({ errors: [{ msg: "Username already exists" }] });
        }

        user = new User({ username, password });
        const newUser = await user.save();

        const payload = {
            user: {
                id: user.id,
            },
        };

        jwtUserApi.sign(payload, configUserApi.jwtSecret, {expiresIn: 3600*24 },
            (err, token) => {
                if(err) throw err;
                res.json({token});
            });

        res.status(201).json({newUser});
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error.");
    }
});


/**
 * POST - Update user
 */
routerUserApi.post("/updateUsers", async (req, res) => {
    try {
        const {_id, username, password, bio, ownRecipes, savedRecipes, following} = req.body;

        const user = await new User({ _id, username, password, bio, ownRecipes, savedRecipes, following });
        const newUser = await User.findOneAndUpdate({ username: username }, user);
        
        if (!newUser) {
            return res.status(400).json( {msg:"User was not found"} );
        }

        res.status(200).json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send("Server error.");
    }
});

module.exports = routerUserApi;
