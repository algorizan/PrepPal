/* eslint-disable no-magic-numbers */
const expressRecipeApi = require("express");
const configRecipeApi = require("../configs/secrets.ts");
const Calendar = require("../models/calendar.ts");

const calendarApi = expressRecipeApi.Router();

/**
 * GET - Init the review for a recipe
 * Used to generate a new table in the database
 */
calendarApi.post("/getCalendar", async (req, res) => {
    try {
        const { username } = req.body;

        const thisCalendar = await Calendar.findOne({ username });

        //(new user)If user does not have a calendar, create and return
        if (!thisCalendar) {
            const newCalendar = await new Calendar({
                username,
                calendarDates: []
            })
            const userCalendar = await newCalendar.save();
            res.status(201).json({ userCalendar });
        }
        //(returning user) return the matching user's calendar
        else {
            res.status(200).json(thisCalendar);
        }
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Server error was: " + error.message);
    }
});

/**
 * POST - update recipe-of-the-day, for given day, for given user
 */
calendarApi.post("/updateCalendar", async (req, res) => {
    try {
        const {
            username,
            dateIs,
            recipeOfTheDayID,
            recipeOfTheDayTitle,
            recipeOfTheDayIngredients
        }
            = req.body;

        if (!username) {
            return res.status(400).json({ msg: "Calendar update requires a user." });
        }
        else if (!dateIs) {
            return res.status(400).json({ msg: "Calendar update requires a date to update." });
        }

        const thisCalendar = await Calendar.findOne({ username });
        if (!thisCalendar) {
            return res.status(400).json({ msg: "No calendar found." });
        }

        const calendarDays = thisCalendar.calendarDate;

        if (calendarDays && calendarDays.length > 0) {
            const index = calendarDays.findIndex(calDate => calDate.dateIs === dateIs);
            //recipe of the day, previously existed, replace
            if (index > -1) {
                thisCalendar.calendarDate[index].recipeOfTheDayID = recipeOfTheDayID;
                thisCalendar.calendarDate[index].recipeOfTheDayTitle = recipeOfTheDayTitle;
                thisCalendar.calendarDate[index].recipeOfTheDayIngredients = recipeOfTheDayIngredients;
            }
            //did not exist previously, add new
            else {
                const calendarDate = {
                    dateIs,
                    recipeOfTheDayID,
                    recipeOfTheDayTitle,
                    recipeOfTheDayIngredients
                }
                await thisCalendar.calendarDate.push(calendarDate);
            }
            await Calendar.findOneAndUpdate({ username }, thisCalendar);
            res.status(201).json({ thisCalendar });
        }
        else {
            const updateCalendar = new Calendar({
                username,
                calendarDate: [{
                    dateIs,
                    recipeOfTheDayID,
                    recipeOfTheDayTitle,
                    recipeOfTheDayIngredients
                }]
            })
            await Calendar.findOneAndUpdate({ username }, updateCalendar);
            res.status(201).json({ updateCalendar });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Could not update calendar date.");
    }
});

module.exports = calendarApi;
