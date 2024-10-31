import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import crypto from "crypto";
import { createServer } from "node:http";
import { join } from "node:path";

global.userID;

// const spoonacularApiKey = import.meta.env.VITE_SPOONACULAR_API_KEY;
// import { searchRecipeTest } from '../SpoonacularAPI/recipes';
// import { all } from "axios";
import user from './src/models/UsersInformation.js';
import restrictions from './src/models/DietaryRestrictions.js'

const PORT = 4000;
const app = express();
const server = createServer(app);

//Minimum 8 characters {8,}, at least one uppercase, symbol, and number
const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[A-Z])/; 
const passwordLength = /^.{8,}$/


app.use(express.json());
app.use(cors());

async function main() {
        await mongoose.connect("mongodb://127.0.0.1:27017/grubgoals");
}

main()
        .then(function () {
                console.log("Mongoose connected!");
        })
        .catch((err) => console.log(err));

app.post("/login", async(req, res) => {
        const { userName, password } = req.body.user;

        try {
                const foundUser = await user.findOne({ userName });
                if (!foundUser) {
                        return res.status(404).send("User not found");
                }

                // we found a user here, so save the userID 
                global.userID = foundUser._id.toString();
                const userID = global.userID;

                if (foundUser.validPass(password)) {
                        console.log("Login successful");
                        res.json({ success: true, userID });
                }
                else {
                        console.log("Wrong password");
                        res.status(401).json({ error: "Wrong password" });
                }
        } //end try
        catch (error) {
                console.error(error);
                res.status(500).json({ error: "Server error" });
        } //end catch

}); //end user login api

app.post("/signup", async (req, res) => {
        const { firstName, lastName, userName, email, password, confirmedPassword } = req.body.user;

        const userEmailFound = await user.findOne({email});

        //check if email already exists
        if (userEmailFound != null) {
                return res.status(400).json({ error: "Email already in use" });
        }

        //check if passwords match
        if (password !== confirmedPassword) {
                return res.status(400).json({ error: "Passwords do not match" });
        }

        //check if password meets regex requirements
        if (!passwordRegex.test(password)) {
                return res.status(400).json({ error: "Password does not meet requirements." });
        }

        if (!passwordLength.test(password)) {
                return res.status(400).json({ error: "Password must be at least 8 characters long." });
        }

        const newID = new mongoose.Types.ObjectId(); // KEEP THIS SETTING HERE. needed for global.userID
        global.userID = newID

        const newUser = new user ({
                //initialize newUser ID with autogenerated ID
                _id: newID, 
                firstName,
                lastName,
                userName,
                email,
                password,
                confirmedPassword
        });

        //call setPass function to hash password
        newUser.setPass(password);

        newUser.save()
                .then(() => {
                        console.log("Registration successful");

                        //Send a JSON response with user ID
                        res.status(201).json({ message: "User registered successfully", userID: newUser._id });
                })
                .catch(err => {
                        console.error("Failed to add new user:", err);
                        res.status(400).json({ message: "Failed to add new user" });
                });

        //create diets document for user
        const newRestrictions = new restrictions ({
                userID: newUser._id,
        });
        newRestrictions.save();

});

app.post('/dietpreferences', async (req, res) => {
        const { allergies, intolerances, dietPreferences, calorieIntake, age, weight, height, gender, activityLevel } = req.body.restrictions;
        const userID = global.userID;
        console.log('restrictions', userID);

        try {
                let userRestrictions = await restrictions.findOne({ userID });

                if (!userRestrictions) {
                        res.status(400).json({ message: "Restrictions not found for user" });
                }

                else {
                        userRestrictions.allergies = allergies;
                        userRestrictions.intolerances = intolerances;
                        userRestrictions.dietPreferences = dietPreferences;
                        userRestrictions.calorieIntake = calorieIntake;
                        userRestrictions.age = age;
                        userRestrictions.weight = weight;
                        userRestrictions.height = height;
                        userRestrictions.gender = gender;
                        userRestrictions.activityLevel = activityLevel;
                } //end else

                await userRestrictions.save();
                console.log('Restrictions saved successfully.');
                res.status(200).json({ message: "Restrictions saved successfully", userID });

        } //end try
        catch (err) {
                console.error("Error saving restrictions:", err);
                res.status(500).json({ error: "Server error while saving restrictions" });
        } //end catch
});

app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}!`);
});
